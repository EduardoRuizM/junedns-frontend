export const data = {
  title: "{{ this.text('domains') }}",
  sort: '+name',
  domains: []
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession())
      this.funcs.reload();
    else
      this.main.funcs.logout();
  },

  reload() {

    const d = this.main.funcs.sendIni('domains');
    fetch(d.url, d.options).then(r => {
      if(this.main.funcs.sendEnd(r))
	return r.json();
    }).then(j => {
      if(j.status === 200)
	this.data.domains = j.domains;
      else
	this.toastShow(j.message || this.text(`err${j.status}`));
    }).catch(err => {
      this.idle(false);
      this.toastShow(err);
    });
  },

  link(domain) {
    return (domain.readonly) ? `<i class="fa-solid fa-earth-europe fa-xs"></i> ${domain.nopunycode}` : `<a href="/domains/${domain.name}" is="jpau-link"><i class="fa-solid fa-earth-europe fa-xs"></i> ${domain.nopunycode}</a>`;
  },

  date(dt) {
    return new Intl.DateTimeFormat(this.lng, {dateStyle: 'full'}).format(new Date(dt));
  },

  records(domain) {
    return `<a href="/domains/${domain.name}/records" is="jpau-link"><i class="fa-solid fa-network-wired"></i> ${domain.records}</a>`;
  },

  del(domain) {
    return (domain.readonly) ? '&nbsp;' : `<i @click="this.windowDel(() => this.funcs.delete('${domain.name}'), '${domain.name}')" class="cp fa-solid fa-xmark req"></i>`;
  },

  sort(field) {
    this.main.funcs.sort(this, field, 'domains');
  },

  delete: async function(name) {
    if(await this.main.funcs.send(`domains/${name}`, 'DELETE')) {

      this.funcs.reload();
      this.main.funcs.wsocket_send({m: 'domains', a: 'delete', id: name});
      this.toastShow(this.text('deleted'));
    }
  }
};

export const html = `<h1><i class="fa-solid fa-globe"></i>
<span>{{ this.text('domains') }}</span> (<span>{{ this.data.domains.length }}</span>)

<div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div>

<div style="float: right" data-jpau-if="this.main.data.user?.is_admin">
  <a href="/domains/new" is="jpau-link">
    <button class="button" style="min-width: max-content; font-size: .54em"><i class="fa-solid fa-plus fa-beat"></i><br><b>{{ this.text('new') }}</b></button>
  </a>
</div>
</h1>

<table width="100%" class="rtbl">
  <thead>
    <tr>
      <th @click="this.funcs.sort('name')" class="cp nosel"><span>{{ this.text('name') }}</span> <i id="sort_name" class="fa-solid fa-sort-down fa-fw"></i></th>
      <th @click="this.funcs.sort('created')" class="cp nosel"><span>{{ this.text('date') }}</span> <i id="sort_created" class="fa-solid fa-sort fa-fw"></i></th>
      <th @click="this.funcs.sort('records')" class="cp nosel"><span>{{ this.text('records') }}</span> <i id="sort_records" class="fa-solid fa-sort fa-fw"></i></th>
      <th>&nbsp;</th>
    </tr>
  </thead>
  <tbody>
    <tr data-jpau-for="for(let domain of this.data.domains)">
      <td :data-cn="{{ this.text('name') }}">{{ this.funcs.link(domain) }}</td>
      <td :data-cn="{{ this.text('date') }}">{{ this.funcs.date(domain.created) }}</td>
      <td class="tc" :data-cn="{{ this.text('records') }}">{{ this.funcs.records(domain) }}</td>
      <td class="tc">{{ this.funcs.del(domain) }}</td>
    </tr>
  </tbody>
</table>
`;
