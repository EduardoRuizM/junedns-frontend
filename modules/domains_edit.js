export const data = {
  title: "{{ this.data.domain.nopunycode }}",
  domain: 0,
  records: [],
  templates: [],
  users: [],
  permissions: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.params.name) {

	const d = this.main.funcs.sendIni(`domains/${this.params.name}`);
	fetch(d.url, d.options).then(r => {
	  if(this.main.funcs.sendEnd(r))
	    return r.json();
	}).then(j => {
	  if(j.status === 200) {
	    if(j.domain.readonly)
	      return this.link('/domains');

	    this.data.domain = j.domain;
	    this.data.records = j.records;
	    this.data.permissions = j.users;
	    this.funcs.getTemplates();
	  } else
	    this.toastShow(j.message || this.text(`err${j.status}`));
	}).catch(err => {
	  this.idle(false);
	  this.toastShow(err);
	});

      } else
	this.link('/domains');

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
	if(this.main.data.user.is_admin)
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

  modify: async function() {

    let d = {template: this.e('template').value};
    if(this.main.data.user.is_admin)
      d.users = this.data.permissions;

    if(await this.main.funcs.send(`domains/${this.data.domain.name}`, 'POST', d)) {

      this.toastShow(this.text('updated'));
      this.main.funcs.wsocket_send({m: 'domains', a: 'edit', id: this.data.domain.id});
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
  },

  value(id, r) {
    return this.data.permissions.some(e => e.user_id === id && ((!r) || (r && e.readonly)));
  }
};

export const html = `<h1><i class="fa-solid fa-globe"></i>
<span>{{ this.data.domain.name }}</span>
<div style="float: right"><a href="/domains" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 320px" class="box">
  <form method="post" @submit="this.funcs.modify()">
    <h3 class="tc"><span>{{ this.data.domain.nopunycode }}</span> &nbsp; <span style="font-size: .7em"><a :href="/domains/{{ this.data.domain.name }}/records" is="jpau-link"><i class="fa-solid fa-network-wired"></i> <span>{{ this.data.records.length }}</span></a></span></h3>
    <div class="txtgrp"><div><i class="fa-solid fa-file-circle-plus fa-fw"></i></div>
    <select id="template">
      <option data-jpau-for="for(let template of this.data.templates)" :value="{{ template.id }}">{{ template.name }}</option>
    </select></div><br>

    <div data-jpau-if="this.main.data.user.is_admin">
      <h3><i class="fa-solid fa-users"></i> <span>{{ this.text('users') }}</span> <i id="toggle" @click="this.funcs.table()" class="cp fa-solid fa-caret-down"></i></h3>
      <table width="100%" id="users" class="rtbl" align="center">
	<thead>
	  <tr>
	    <th><span>{{ this.text('name') }}</span></th>
	    <th><span>{{ this.text('readonly') }}</span></th>
	  </tr>
	</thead>
	<tbody>
	  <tr data-jpau-for="for(let user of this.data.users)">
	    <td :data-cn="{{ this.text('name') }}"><input type="checkbox" :id="user_{{ user.id }}" *checked="{{ this.funcs.value(user.id) }}" @click="this.funcs.check({{ user.id }})" class="switch"> <label :for="user_{{ user.id }}">{{ user.code }}</label></td>
	    <td :data-cn="{{ this.text('readonly') }}" class="tc"><input type="checkbox" :id="readonly_{{ user.id }}" *checked="{{ this.funcs.value(user.id, true) }}" *disabled="{{ !this.funcs.value(user.id) }}" @click="this.funcs.check({{ user.id }})" class="switch"></td>
	  </tr>
	</tbody>
      </table><br>
    </div>
` + june_pau.main.funcs.buttons(false, true) + `
  </form>
</div>
`;
