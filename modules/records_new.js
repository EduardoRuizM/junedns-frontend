export const data = {
  title: "{{ this.text('records') + ' ('  + this.text('new') + ')' }}",
  domain: 0,
  selType: 'A'
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
	    this.e('frecords').innerHTML = this.main.funcs.records();
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

  new: async function() {
    let name = this.e('name').value.trim();
    name+= ((name === '') ? '' : '.') + this.data.domain.name;
    if(await this.main.funcs.send(`domains/${this.data.domain.name}/records`, 'POST', {name: name, type: this.data.selType, content: this.main.funcs.recordfrm(), ttl: this.e('ttl').value, disabled: this.e('disabled').checked, no_ip: this.e('no-ip').checked})) {

      this.toastShow(this.text('created'));
      this.main.funcs.wsocket_send({m: 'records', a: 'new', id: this.data.domain.name});
      this.link(`/domains/${this.data.domain.name}/records`);
    }
  }
};

export const html = `<h1><i class="fa-solid fa-network-wired"></i>
<span>{{ this.text('records') }}</span> - <span>{{ this.data.domain.name }}</span> (<span>{{ this.text('new') }}</span>)
<div style="float: right"><a :href="/domains/{{ this.data.domain.name }}/records" is="jpau-link"><button class="button" style="min-width: max-content; font-size: .52em"><i class="fa-solid fa-arrow-left"></i><br><b>{{ this.text('back') }}</b></button></a></div>
</h1>

<div style="width: 420px" class="box">
  <form method="post" @submit="this.funcs.new()">
    <div class="tc">
      <div>{{ this.text('name') }}</div>
      <input type="text" id="name" size="10" maxlength="200" class="txt"> .<span>{{ this.data.domain.name }}</span>
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
    <div id="frecords"></div>
    <div class="tc"><br>
      <div class="ib vt" style="padding: 0 6px"><input type="checkbox" id="disabled" class="switch"><label for="disabled">{{ this.text('disabled') }}</label></div>
      <div class="ib vt" style="padding: 0 6px"><input type="checkbox" id="no-ip" class="switch"><label for="no-ip">{{ this.text('no_ip') }}</label></div>
    </div><br>

` + june_pau.main.funcs.buttons() + `
  </form>
</div>
`;
