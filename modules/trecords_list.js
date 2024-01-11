export const data = {
  title: "{{ this.text('records') }}",
  sort: '+name',
  template: [],
  records: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin) {

	if(this.params.id)
	  this.funcs.reload();
	else
	  this.link('/templates');

      } else {
	this.toastShow('err403');
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  reload() {

    const t = this.main.funcs.sendIni(`templates/${this.params.id}`);
    fetch(t.url, t.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
      }).then(j => {
	if(j.status === 200) {
	  this.data.template = j.template;
	  this.data.records = j.records;
	} else
	  this.toastShow(j.message || this.text(`err${j.status}`));
      }).catch(err => {
	this.idle(false);
	this.toastShow(err);
      });
  },

  del(record) {
    return `<i @click="this.windowDel(() => this.funcs.delete('${record.id}'), '${record.name}')" class="cp fa-solid fa-xmark req"></i>`;
  },

  sort(field) {
    this.main.funcs.sort(this, field, 'records');
  },

  delete: async function(id) {
    if(await this.main.funcs.send(`templates/${this.data.template.id}/records/${id}`, 'DELETE')) {

      this.funcs.reload();
      this.main.funcs.wsocket_send({m: 'trecords', a: 'delete', id: this.data.template.id});
      this.toastShow(this.text('deleted'));
    }
  }
};

export const html = `<h1><i class="fa-solid fa-network-wired"></i>
<span>{{ this.text('records') }}</span> - <span>{{ this.htmlEntities(this.data.template.name) }}</span> (<span>{{ this.data.records.length }}</span>)

<div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div>

<div style="float: right">
  <a href="/templates" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left fa-fw"></i><br><b>{{ this.text('back') }}</b></button>
  </a>
  <a :href="/templates/{{ this.data.template.id }}/records/new" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .54em"><i class="fa-solid fa-plus fa-beat fa-fw"></i><br><b>{{ this.text('new') }}</b></button>
  </a>
</div>
</h1>

<table width="100%" class="rtbl">
  <thead>
    <tr>
      <th @click="this.funcs.sort('name')" class="cp nosel"><span>{{ this.text('name') }}</span> <i id="sort_name" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('type')" class="cp nosel"><span>{{ this.text('type') }}</span> <i id="sort_type" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('content')" class="cp nosel"><span>{{ this.text('content') }}</span> <i id="sort_content" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('ttl')" class="cp nosel"><span>{{ this.text('ttl') }}</span> <i id="sort_ttl" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
    <tr data-jpau-for="for(let record of this.data.records)">
      <td :data-cn="{{ this.text('name') }}"><a :href="/templates/{{ this.data.template.id }}/records/{{ record.id }}" is="jpau-link"><span>{{ record.name }}</span></a></td>
      <td class="tc" :data-cn="{{ this.text('type') }}">{{ record.type }}</td>
      <td :data-cn="{{ this.text('content') }}">{{ record.content || '' }}</td>
      <td class="tc" :data-cn="{{ this.text('ttl') }}">{{ record.ttl || '' }}</td>
      <td class="tc">{{ this.funcs.del(record) }}</td>
    </tr>
  </tbody>
</table>
`;
