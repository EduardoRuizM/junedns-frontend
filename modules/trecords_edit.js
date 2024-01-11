export const data = {
  title: "{{ this.data.template.name }}",
  template: 0,
  record: 0
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin) {

	if(this.params.id && this.params.rid) {

	  const t = this.main.funcs.sendIni(`templates/${this.params.id}`);
	  fetch(t.url, t.options).then(r => {
	    if(this.main.funcs.sendEnd(r))
	      return r.json();
	  }).then(j => {
	    if(j.status === 200) {
	      this.data.template = j.template;
	      if(!(this.data.record = j.records.find(({ id }) => id == this.params.rid)))
		return this.link('/templates');

	      this.data.record.name = this.data.record.name.slice(0, this.data.record.name.length - '%d%'.length).replace(/\.$/, '');
	      this.e('frecords').innerHTML = this.main.funcs.records(this.data.record.content, true);
	    } else
	      this.toastShow(j.message || this.text(`err${j.status}`));
	  }).catch(err => {
	    this.idle(false);
	    this.toastShow(err);
	  });

	} else
	  this.link('/templates');

      } else {
	this.toastShow('err403');
	this.link('/domains');
      }

    } else
      this.main.funcs.logout();
  },

  modify: async function() {
    let name = this.e('name').value.trim();
    name+= ((name === '') ? '' : '.') + '%d%';
    let data = {name: name, type: this.data.record.type, content: this.main.funcs.recordfrm(), ttl: this.data.record.ttl};
    if(await this.main.funcs.send(`templates/${this.data.template.id}/records/${this.params.rid}`, 'POST', data)) {

      this.toastShow(this.text('updated'));
      this.main.funcs.wsocket_send({m: 'trecords', a: 'edit', id: this.data.template.id});
      this.link(`/templates/${this.data.template.id}/records`);
    }
  }
};

export const html = `<h1><i class="fa-solid fa-network-wired"></i>
<span>{{ this.data.template.name }}</span> - <span>{{ this.data.record.name }}</span>
<div style="float: right"><a :href="/templates/{{ this.data.template.id }}/records" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 420px" class="box">
  <form method="post" @submit="this.funcs.modify()">
    <div class="tc">
      <div>{{ this.text('name') }}</div>
      <input type="text" id="name" size="10" maxlength="200" *value="this.data.record.name" class="txt"> .<span>%d%</span>
    </div><div class="tc">
      <div class="ib vt" style="padding: 0 6px">
	<div>{{ this.text('type') }}</div>
	<select id="type">
	  <option data-jpau-for="for(let type in this.main.data.types)" :value="{{ type }}" *selected="this.data.record.type">{{ type }}</option>
	</select>
      </div>
      <div class="ib vt" style="padding: 0 6px">
	<div>{{ this.text('ttl') }}</div>
	<input type="number" id="ttl" size="8" min="30" max="4294967295" step="1" *value="this.data.record.ttl" class="txt">
      </div>
    </div>
    <div id="frecords"></div><br>

` + june_pau.main.funcs.buttons() + `
  </form>
</div>
`;
