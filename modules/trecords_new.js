export const data = {
  title: "{{ this.text('records') + ' ('  + this.text('new') + ')' }}",
  template: 0,
  selType: 'A'
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession()) {

      if(this.main.data.user.is_admin) {

	if(this.params.id) {

	  const t = this.main.funcs.sendIni(`templates/${this.params.id}`);
	  fetch(t.url, t.options).then(r => {
	    if(this.main.funcs.sendEnd(r))
	      return r.json();
	  }).then(j => {
	    if(j.status === 200) {
	      this.data.template = j.template;
	      this.e('frecords').innerHTML = this.main.funcs.records();
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

  new: async function() {
    let name = this.e('name').value.trim();
    name+= ((name === '') ? '' : '.') + '%d%';
    if(await this.main.funcs.send(`templates/${this.data.template.id}/records`, 'POST', {name: name, type: this.data.selType, content: this.main.funcs.recordfrm(), ttl: this.e('ttl').value})) {

      this.toastShow(this.text('created'));
      this.main.funcs.wsocket_send({m: 'trecords', a: 'new', id: this.data.template.id});
      this.link(`/templates/${this.data.template.id}/records`);
    }
  }
};

export const html = `<h1><i class="fa-solid fa-network-wired"></i>
<span>{{ this.text('records') }}</span> - <span>{{ this.data.template.name }}</span> (<span>{{ this.text('new') }}</span>)
<div style="float: right"><a :href="/templates/{{ this.data.template.id }}/records" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 420px" class="box">
  <form method="post" @submit="this.funcs.new()">
    <div class="tc">
      <div>{{ this.text('name') }}</div>
      <input type="text" id="name" size="10" maxlength="200" class="txt"> .<span>%d%</span>
    </div><div class="tc">
      <div class="ib vt" style="padding: 0 6px">
	<div>{{ this.text('type') }}</div>
	<select id="type">
	  <option data-jpau-for="for(let type in this.main.data.types)" :value="{{ type }}" *selected="this.data.selType">{{ type }}</option>
	</select>
      </div><div class="ib vt" style="padding: 0 6px">
	<div>{{ this.text('ttl') }}</div>
	<input type="number" id="ttl" size="8" min="30" max="4294967295" step="1" class="txt">
      </div>
    </div>
    <div id="frecords"></div><br>

` + june_pau.main.funcs.buttons() + `
  </form>
</div>
`;
