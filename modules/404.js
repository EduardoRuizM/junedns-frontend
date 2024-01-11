export const funcs = {
  onMount: async function() {
    await this.config.funcs.checkSession();
  }
};

export const data = {
	title: "{{ this.text('err404') }}"
};

export const html = `<h1>{{ this.text('err404') }}</h1>`;
