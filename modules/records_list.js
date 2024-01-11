export const data = {
  title: "{{ this.text('records') }}",
  sort: '+name',
  domain: [],
  records: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.params.name)
	this.funcs.reload();
      else
	this.link('/domains');

    } else
      this.main.funcs.logout();
  },

  reload() {

    const d = this.main.funcs.sendIni(`domains/${this.params.name}`);
    fetch(d.url, d.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
      }).then(j => {
	if(j.status === 200) {
	  this.data.domain = j.domain;
	  this.data.records = j.records;
	} else
	  this.toastShow(j.message || this.text(`err${j.status}`));
      }).catch(err => {
	this.idle(false);
	this.toastShow(err);
      });
  },

  del(record) {
    return (this.data.domain.readonly) ? '&nbsp;' : `<i @click="this.windowDel(() => this.funcs.delete('${record.id}'), '${record.name}')" class="cp fa-solid fa-xmark req"></i>`;
  },

  sort(field) {
    this.main.funcs.sort(this, field, 'records');
  },

  no_ip(record) {
    return (record.no_ip) ? `<span data-tooltip="${this.htmlEntities(record.no_ip)}"><i onclick="navigator.clipboard.writeText('${record.no_ip}')" class="cp fa-solid fa-copy"></i></span>` : '';
  },

  delete: async function(id) {
    if(await this.main.funcs.send(`domains/${this.data.domain.name}/records/${id}`, 'DELETE')) {

      this.funcs.reload();
      this.main.funcs.wsocket_send({m: 'records', a: 'delete', id: this.data.domain.name});
      this.toastShow(this.text('deleted'));
    }
  }
};

export const html = `<h1><i class="fa-solid fa-network-wired"></i>
<span>{{ this.text('records') }}</span> - <span>{{ this.htmlEntities(this.data.domain.nopunycode) }}</span> (<span>{{ this.data.records.length }}</span>)

<div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div>

<div style="float: right">
  <a href="/domains" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left fa-fw"></i><br><b>{{ this.text('back') }}</b></button>
  </a>
  <a :href="/domains/{{ this.data.domain.name }}/records/new" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .54em"><i class="fa-solid fa-plus fa-beat fa-fw"></i><br><b>{{ this.text('new') }}</b></button>
  </a>
</div>
</h1>

<style>
.rcnt {
	max-width: 20vw;
}
@media screen and (max-width: 600px) {
  .rcnt {
	max-width: 94vw;
  }
}
</style>
<table width="100%" class="rtbl">
  <thead>
    <tr>
      <th @click="this.funcs.sort('name')" class="cp nosel"><span>{{ this.text('name') }}</span> <i id="sort_name" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('type')" class="cp nosel"><span>{{ this.text('type') }}</span> <i id="sort_type" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('content')" class="cp nosel"><span>{{ this.text('content') }}</span> <i id="sort_content" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('ttl')" class="cp nosel"><span>{{ this.text('ttl') }}</span> <i id="sort_ttl" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('disabled')" class="cp nosel"><span>{{ this.text('disabled') }}</span> <i id="sort_disabled" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th><span>{{ this.text('no_ip') }}</span></th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
    <tr data-jpau-for="for(let record of this.data.records)">
      <td :data-cn="{{ this.text('name') }}"><a :href="/domains/{{ this.data.domain.name }}/records/{{ record.id }}" is="jpau-link"><span>{{ record.name }}</span></a></td>
      <td class="tc" :data-cn="{{ this.text('type') }}">{{ record.type }}</td>
      <td :data-cn="{{ this.text('content') }}" :data-tooltip="{{ this.htmlEntities(record.content || '') }}" style="overflow: visible"><div class="ellp rcnt">{{ this.htmlEntities(record.content || '') }}</div></td>
      <td class="tc" :data-cn="{{ this.text('ttl') }}">{{ record.ttl || '' }}</td>
      <td class="tc" :data-cn="{{ this.text('disabled') }}">{{ this.main.funcs.chk(record.disabled) }}</td>
      <td class="tc" :data-cn="{{ this.text('no_ip') }}" style="overflow: visible">{{ this.funcs.no_ip(record) }}</td>
      <td class="tc">{{ this.funcs.del(record) }}</td>
    </tr>
  </tbody>
</table>
`;
