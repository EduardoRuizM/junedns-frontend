export const data = {
  title: "{{ this.text('templates') + ' ('  + this.text('new') + ')' }}"
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(!this.main.data.user.is_admin) {
	this.toastShow(this.text('err403'));
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  new: async function() {

    if(await this.main.funcs.send('templates', 'POST', {name: this.e('name').value, description: this.e('description').value, is_default: this.e('is_default').checked})) {

      this.toastShow(this.text('created'));
      this.main.funcs.wsocket_send({m: 'templates', a: 'new'});
      this.link('/templates');
    }
  }
};

export const html = `<h1><i class="fa-solid fa-file-circle-plus"></i>
<span>{{ this.text('templates') }}</span> (<span>{{ this.text('new') }}</span>)
<div style="float: right"><a href="/templates" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 320px" class="box">
  <form method="post" @submit="this.funcs.new()">
    <div class="txtgrp"><div><i class="fa-solid fa-pen fa-fw"></i></div><input type="text" id="name" maxlength="50" required :placeholder="{{ this.text('name') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-file-lines fa-fw"></i></div><input type="text" id="description" maxlength="100" :placeholder="{{ this.text('description') }}"></div><br>
    <div class="tc"><input type="checkbox" id="is_default" class="switch"><label for="is_default">{{ this.text('default') }}</label></div><br>
` + june_pau.main.funcs.buttons() + `
  </form>
</div>
`;
