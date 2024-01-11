export const data = {
  title: "{{ this.text('domains') + ' ('  + this.text('new') + ')' }}",
  templates: [],
  users: [],
  permissions: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin)
	this.funcs.getTemplates();
      else {
	this.toastShow(this.text('err403'));
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  getTemplates() {

    const t = this.main.funcs.sendIni('templates');
    fetch(t.url, t.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200) {
	this.data.templates = [{id: '', name: `(${this.text('template')})`}];
	if(Array.isArray(j.templates))
	  this.data.templates = this.data.templates.concat(j.templates);
	this.funcs.getUsers();
      } else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  getUsers() {

    const u = this.main.funcs.sendIni('users');
    fetch(u.url, u.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200 && Array.isArray(j.users))
	this.data.users = j.users.filter(u => !u.is_admin);
      else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  new: async function() {

    if(await this.main.funcs.send('domains', 'POST', {name: this.e('name').value, template: this.e('template').value, users: this.data.permissions})) {

      this.toastShow(this.text('created'));
      this.main.funcs.wsocket_send({m: 'domains', a: 'new'});
      this.link('/domains');
    }
  },

  table() {
    const c = this.e('toggle').className.includes('down');
    this.e('toggle').className = 'cp fa-solid fa-caret-' + ((c) ? 'up' : 'down');
    this.e('users').style.display = (c) ? 'none' : '';
  },

  check(id) {
    this.data.permissions = this.data.permissions.filter(e => e.user_id !== id);
    if(this.e(`user_${id}`).checked)
      this.data.permissions.push({user_id: id, readonly: (this.e(`readonly_${id}`).checked) ? 1 : 0});
    this.e(`readonly_${id}`).disabled = !this.e(`user_${id}`).checked;
  }
};

export const html = `<h1><i class="fa-solid fa-globe"></i>
<span>{{ this.text('domains') }}</span> (<span>{{ this.text('new') }}</span>)
<div style="float: right"><a href="/domains" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 320px" class="box">
  <form method="post" @submit="this.funcs.new()">
    <div class="txtgrp"><div><i class="fa-solid fa-globe fa-fw"></i></div><input type="text" id="name" maxlength="63" required pattern="^[^ _\\-]{1}[^ _]+\\.[a-z]{2,4}$" :placeholder="{{ this.text('name') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-file-circle-plus fa-fw"></i></div>
    <select id="template">
      <option data-jpau-for="for(let template of this.data.templates)" :value="{{ template.id }}" *selected="template.is_default">{{ template.name }}</option>
    </select></div>

    <h3><i class="fa-solid fa-users"></i> <span>{{ this.text('users') }}</span> <i id="toggle" @click="this.funcs.table()" class="cp fa-solid fa-caret-down"></i></h3>
    <table width="100%" id="users" class="rtbl" align="center">
      <thead>
	<tr>
	  <th><span>{{ this.text('code') }}</span></th>
	  <th><span>{{ this.text('readonly') }}</span></th>
	</tr>
      </thead>
      <tbody>
	<tr data-jpau-for="for(let user of this.data.users)">
	  <td :data-cn="{{ this.text('code') }}"><input type="checkbox" :id="user_{{ user.id }}" @click="this.funcs.check({{ user.id }})" class="switch"> <label :for="user_{{ user.id }}">{{ user.code }}</label></td>
	  <td :data-cn="{{ this.text('readonly') }}" class="tc"><input type="checkbox" :id="readonly_{{ user.id }}" @click="this.funcs.check({{ user.id }})" class="switch" disabled></td>
	</tr>
      </tbody>
    </table><br>

` + june_pau.main.funcs.buttons(false, true) + `
  </form>
</div>
`;
