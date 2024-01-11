export const data = {
  title: "{{ this.data.template.name }}",
  template: 0
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin && this.params.id) {

	const u = this.main.funcs.sendIni(`templates/${this.params.id}`);
	fetch(u.url, u.options).then(r => {
	  if(this.main.funcs.sendEnd(r))
	    return r.json();
	}).then(j => {
	  if(j.status === 200) {
	    this.data.template = j.template;
	  } else
	    this.toastShow(j.message || this.text(`err${j.status}`));
	}).catch(err => {
	  this.idle(false);
	  this.toastShow(err);
	});

      } else {
	this.toastShow(this.text('err403'));
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  modify: async function() {

    if(await this.main.funcs.send(`templates/${this.data.template.id}`, 'POST', {name: this.e('name').value, description: this.e('description').value, is_default: this.e('is_default').checked})) {

      this.toastShow(this.text('updated'));
      this.main.funcs.wsocket_send({m: 'templates', a: 'edit', 'id': this.data.template.id});
      this.link('/templates');
    }
  }
};

export const html = `<h1><i class="fa-solid fa-file-circle-plus"></i>
<span>{{ this.data.template.name }}</span>
<div style="float: right"><a href="/templates" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 320px" class="box">
  <form method="post" @submit="this.funcs.modify()">
    <div class="txtgrp"><div><i class="fa-solid fa-pen fa-fw"></i></div><input type="text" id="name" maxlength="50" required *value="this.data.template.name" :placeholder="{{ this.text('name') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-file-lines fa-fw"></i></div><input type="text" id="description" maxlength="100" *value="this.data.template.description" :placeholder="{{ this.text('description') }}"></div><br>
    <div class="tc"><input type="checkbox" id="is_default" *checked="{{ this.data.template.is_default }}" class="switch"><label for="is_default">{{ this.text('default') }}</label></div><br>
` + june_pau.main.funcs.buttons() + `
  </form>
</div>
`;
