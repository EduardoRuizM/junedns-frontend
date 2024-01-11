export const data = {
  title: "{{ this.text('users') }}",
  sort: '+code',
  users: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin)
	this.funcs.reload();
      else {
	this.toastShow('err403');
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  reload() {

    const u = this.main.funcs.sendIni('users');
    fetch(u.url, u.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200)
	this.data.users = j.users;
      else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  del(user) {
    return `<i @click="this.windowDel(() => this.funcs.delete('${user.id}'), '${user.code}')" class="cp fa-solid fa-xmark req"></i>`;
  },

  sort(field) {
    this.main.funcs.sort(this, field, 'users');
  },

  delete: async function(id) {

    if(await this.main.funcs.send(`users/${id}`, 'DELETE')) {

      this.funcs.reload();
      this.main.funcs.wsocket_send({m: 'users', a: 'delete', id: id});
      this.toastShow(this.text('deleted'));
    }
  }
};

export const html = `<h1><i class="fa-solid fa-users"></i>
<span>{{ this.text('users') }}</span> (<span>{{ this.data.users.length }}</span>)

<div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div>

<div style="float: right">
  <a href="/users/new" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .54em"><i class="fa-solid fa-plus"></i><br><b>{{ this.text('new') }}</b></button>
  </a>
</div>
</h1>

<table width="100%" class="rtbl">
  <thead>
    <tr>
      <th @click="this.funcs.sort('code')" class="cp nosel"><span>{{ this.text('code') }}</span> <i id="sort_code" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('name')" class="cp nosel"><span>{{ this.text('name') }}</span> <i id="sort_name" class="fa-solid fa-sort fa-fw"></i></th>
      <th @click="this.funcs.sort('is_admin')" class="cp nosel"><span>{{ this.text('admin') }}</span> <i id="sort_is_admin" class="fa-solid fa-sort fa-fw"></i></th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
    <tr data-jpau-for="for(let user of this.data.users)">
      <td :data-cn="{{ this.text('code') }}"><a :href="/users/{{ user.id }}" is="jpau-link"><i class="fa-solid fa-user"></i> <span>{{ user.code }}</span></a></td>
      <td :data-cn="{{ this.text('name') }}">{{ this.htmlEntities(user.name) }}</td>
      <td class="tc" :data-cn="{{ this.text('admin') }}">{{ this.main.funcs.chk(user.is_admin) }}</td>
      <td class="tc">{{ this.funcs.del(user) }}</td>
    </tr>
  </tbody>
</table>
`;
