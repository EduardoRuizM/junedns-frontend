export const data = {
  title: "{{ this.text('users') + ' ('  + this.text('new') + ')' }}",
  is_admin: false,
  domains: [],
  permissions: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin)
	this.funcs.getDomains();
      else {
	this.toastShow(this.text('err403'));
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  getDomains() {

    const d = this.main.funcs.sendIni('domains');
    fetch(d.url, d.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200 && Array.isArray(j.domains))
	this.data.domains = j.domains;
      else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  new: async function() {

    if(await this.main.funcs.send('users', 'POST', {code: this.e('code').value, passwd: this.e('passwd').value, name: this.e('name').value, is_admin: this.e('is_admin').checked, domains: this.data.permissions})) {

      this.toastShow(this.text('created'));
      this.main.funcs.wsocket_send({m: 'users', a: 'new'});
      this.link('/users');
    }
  },

  table() {
    const c = this.e('toggle').className.includes('down');
    this.e('toggle').className = 'cp fa-solid fa-caret-' + ((c) ? 'up' : 'down');
    this.e('domains').style.display = (c) ? 'none' : '';
  },

  check(id) {
    this.data.permissions = this.data.permissions.filter(e => e.domain_id !== id);
    if(this.e(`domain_${id}`).checked)
      this.data.permissions.push({domain_id: id, readonly: (this.e(`readonly_${id}`).checked) ? 1 : 0});
    this.e(`readonly_${id}`).disabled = !this.e(`domain_${id}`).checked;
  }
};

export const html = `<h1><i class="fa-solid fa-user"></i>
<span>{{ this.text('users') }}</span> (<span>{{ this.text('new') }}</span>)
<div style="float: right"><a href="/users" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 420px" class="box">
  <form method="post" @submit="this.funcs.new()">
    <div class="txtgrp"><div><i class="fa-solid fa-user fa-fw"></i></div><input type="text" id="code" maxlength="25" required :placeholder="{{ this.text('code') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-lock fa-fw"></i></div><input type="password" id="passwd" minlength="8" maxlength="25" required :placeholder="{{ this.text('password') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-person fa-fw"></i></div><input type="text" id="name" maxlength="50" :placeholder="{{ this.text('name') }}"></div><br>
    <div class="tc"><input type="checkbox" id="is_admin" @click="this.data.is_admin = !this.data.is_admin" class="switch"><label for="is_admin">{{ this.text('admin') }}</label></div>

    <div data-jpau-if="!this.data.is_admin">
      <h3><i class="fa-solid fa-globe"></i> <span>{{ this.text('domains') }}</span> <i id="toggle" @click="this.funcs.table()" class="cp fa-solid fa-caret-down"></i></h3>
      <div id="domains" style="max-height: 400px; overflow-y: auto">
	<table class="rtbl" align="center">
	  <thead>
	    <tr>
	      <th><span>{{ this.text('name') }}</span></th>
	      <th><span>{{ this.text('readonly') }}</span></th>
	    </tr>
	  </thead>
	  <tbody>
	    <tr data-jpau-for="for(let domain of this.data.domains)">
	      <td :data-cn="{{ this.text('name') }}" style="white-space: nowrap"><input type="checkbox" :id="domain_{{ domain.id }}" @click="this.funcs.check({{ domain.id }})" class="switch"> <label :for="domain_{{ domain.id }}">{{ domain.nopunycode }}</label></td>
	      <td :data-cn="{{ this.text('readonly') }}" class="tc"><input type="checkbox" :id="readonly_{{ domain.id }}" @click="this.funcs.check({{ domain.id }})" class="switch" disabled></td>
	    </tr>
	  </tbody>
	</table>
      </div>
    </div><br>

` + june_pau.main.funcs.buttons(false, true) + `
  </form>
</div>
`;
