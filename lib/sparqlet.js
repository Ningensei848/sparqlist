const marked = require('marked');
const SPARQLetParser = require('./parser');
const Procedure = require('./procedure');
const _ = require('lodash');

module.exports = class SPARQLet {
  constructor(name, markdown) {
    this.name = name;
    this.markdown = markdown;
  }

  index() {
    return marked(this.markdown.toString());
  }

  async execute(query, accept) {
    const defaultResolvedParams = this.defaultResolvedParams(query);
    const {error, traces} = await this.procedures.reduce(async (acc, proc) => {
      const {traces, context, error} = await acc;
      if (error) {
        return {traces, context, error};
      }
      const isFinal = traces.length === this.procedures.length - 1;
      const ctx = JSON.parse(JSON.stringify(context));

      let results, contentType, currentError;
      const logEntries = [];
      try {
        const r = await Procedure.create(proc).execute(ctx, logEntries, isFinal ? accept : undefined);
        results = r.results;
        contentType = r.contentType;
      } catch(e) {
        currentError = {message: e.message};
        console.error(e);
      }
      const update = proc.bindingName && {[proc.bindingName]: results};
      const nextContext = Object.assign(JSON.parse(JSON.stringify(context)), update);
      const updatedContext = update && nextContext;

      return {
        context: nextContext,
        traces: traces.concat({
          step: {
            name: proc.name,
            type: proc.type
          },
          logEntries,
          results,
          contentType,
          error: currentError,
          updatedContext,
        }),
        error: currentError,
      };
    }, {traces: [], context: {params: defaultResolvedParams}});

    const results = traces.length > 0 ? traces[traces.length-1].results : null;
    const contentType = results ? traces[traces.length-1].contentType : null;

    return {
      error,
      results,
      contentType,
      traces
    };
  }

  defaultResolvedParams(params) {
    const defaults = this.params.reduce((acc, param) => {
      acc[param.name] = param.default;
      return acc;
    }, {});
    return Object.assign(defaults, params);
  }

  apiPath() {
    return '/api/' + this.name;
  }

  traceModeApiPath() {
    return '/trace/' + this.name;
  }

  mdPath() {
    return this.name + '.md';
  }

  toJSON() {
    return {
      type: 'sparqlet',
      id: this.name,
      attributes: {
        name: this.name,
        title: this.title,
        src: this.markdown.toString(),
        html: this.index(),
        'api-path': this.apiPath(),
        'trace-mode-api-path': this.traceModeApiPath(),
        params: this.params,
        'md-path': this.mdPath(),
      }
    };
  }

  static load(name, markdown) {
    const parser = new SPARQLetParser();
    const data = parser.parse(markdown);
    return Object.assign(new this(name, markdown), data);
  }
};
