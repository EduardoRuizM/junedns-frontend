export const data = {
  title: "{{ this.text('templates') }}",
  sort: '+name',
  templates: []
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

    const t = this.main.funcs.sendIni('templates');
    fetch(t.url, t.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200)
	this.data.templates = j.templates;
      else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  records(template) {
    return `<a href="/templates/${template.id}/records" is="jpau-link"><i class="fa-solid fa-network-wired"></i> ${template.records}</a>`;
  },

  del(template) {
    return `<i @click="this.windowDel(() => this.funcs.delete('${template.id}'), '${template.name}')" class="cp fa-solid fa-xmark req"></i>`;
  },

  sort(field) {
    this.main.funcs.sort(this, field, 'templates');
  },

  delete: async function(id) {
    if(await this.main.funcs.send(`templates/${id}`, 'DELETE')) {

      this.funcs.reload();
      this.main.funcs.wsocket_send({m: 'templates', a: 'delete', id: id});
      this.toastShow(this.text('deleted'));
    }
  }
};

export const html = `<h1><i class="fa-solid fa-file-circle-plus"></i>
<span>{{ this.text('templates') }}</span> (<span>{{ this.data.templates.length }}</span>)

<div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div>

<div style="float: right">
  <a href="/templates/new" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .54em"><i class="fa-solid fa-plus fa-beat"></i><br><b>{{ this.text('new') }}</b></button>
  </a>
</div>
</h1>

<table width="100%" class="rtbl">
  <thead>
    <tr>
      <th @click="this.funcs.sort('name')" class="cp nosel"><span>{{ this.text('name') }}</span> <i id="sort_name" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('description')" class="cp nosel"><span>{{ this.text('description') }}</span> <i id="sort_description" class="fa-solid fa-sort fa-fw"></i></th>
      <th @click="this.funcs.sort('is_default')" class="cp nosel"><span>{{ this.text('default') }}</span> <i id="sort_is_default" class="fa-solid fa-sort fa-fw"></i></th>
      <th @click="this.funcs.sort('records')" class="cp nosel"><span>{{ this.text('records') }}</span> <i id="sort_records" class="fa-solid fa-sort fa-fw"></i></th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
    <tr data-jpau-for="for(let template of this.data.templates)">
      <td :data-cn="{{ this.text('name') }}"><a :href="/templates/{{ template.id }}" is="jpau-link">{{ this.htmlEntities(template.name) }}</a></td>
      <td :data-cn="{{ this.text('description') }}">{{ this.htmlEntities(template.description) }}</td>
      <td class="tc" :data-cn="{{ this.text('admin') }}">{{ this.main.funcs.chk(template.is_default) }}</td>
      <td class="tc" :data-cn="{{ this.text('records') }}">{{ this.funcs.records(template) }}</td>
      <td class="tc">{{ this.funcs.del(template) }}</td>
    </tr>
  </tbody>
</table>
`;
