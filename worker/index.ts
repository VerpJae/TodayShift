type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
