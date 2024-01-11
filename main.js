export const data = {	forceUpdate: false,
			uploadLargeMax: 10240,
			toastPY: '90px',
			backend_url: 'http://localhost:9053',
			backend_ws: 'localhost:9053',
			auth: true,
			_token: 0,
			expiry_token: 900,
			session_timer: 0,
			loader: 'idLoader',
			types: {},
			user: 0
};

export const dataws = {wsocket: 0, wsocket_tmr: 0};

export const funcs = {

  onMount: () => document.body.style.opacity = 1,

  sendIni(url, method, data, pget = {}) {

    data = (typeof data === 'string') ? this.fdata(data) : data;
    pget = {...pget, lang: this.lng};
    this.main.funcs.sendBtt(true);
    this.e('bttSubmit') && (this.e('bttSubmit').disabled = true);

    return this.sendReqIni(`${this.main.data.backend_url}/${url}`, method, data, pget);
  },

  sendBtt(s) {
    this.e('bttSubmit') && (this.e('bttSubmit').disabled = s);
  },

  sendEnd(res) {

    const headers = this.sendReqEnd(res);
    this.main.funcs.timerSession();
    this.main.funcs.sendBtt(false);

    if(headers['x-access-token']) {

      localStorage.setItem('token', headers['x-access-token']);
      this.main.funcs.wsocket_send();
    }

    if(headers['x-access-user'])
      this.main.data.user = (headers['x-access-user']) ? JSON.parse(atob(headers['x-access-user'])) : 0;

    if(res.status === 401)
      this.main.funcs.logout();

    return (res.status !== 401);
  },

  send: async function(url, method, data, pget = {}) {

    try {
      const p = this.main.funcs.sendIni(url, method, data, pget);
      const r = await fetch(p.url, p.options), j = await r.json();
      if(!this.main.funcs.sendEnd(r))
	return;
      if(r.ok)
	return j;
      else if(r.status !== 401)
	this.toastShow(j.message || this.text(`err${r.status}`));
    } catch(e) {
      this.idle(false);
      this.toastShow(e);
      this.main.funcs.sendBtt(false);
    }
  },

  timerSession() {

    if(this.main.data._token && this.main.data.expiry_token > 0 && this.main.data.user) {

      clearTimeout(this.main.data.session_timer);
      this.main.data.session_timer = setTimeout(function() {this.main.funcs.logout()}.bind(this), this.main.data.expiry_token * 1000);
    }
  },

  initSession(r) {

    this.main.data.types = r.types;
    this.main.data.expiry_token = r.expiry_token;
    this.main.funcs.wsocket_create();
    this.main.funcs.timerSession();
  },

  checkSession: async function() {

    if(!this.main.data._token && (this.main.data._token = localStorage.getItem('token'))) {

      const r = await this.main.funcs.send('login');
      if(r)
	this.main.funcs.initSession(r);
    }

    if(this.main.data.user)
      this.main.funcs.timerSession();

    return !!this.main.data.user;
  },

  logout(force) {

    this.main.data._token = this.main.data.user = 0;
    if(force || this.data.expiry_token !== -1)
      localStorage.removeItem('token');

    this.stopp();
    clearTimeout(this.main.data.session_timer);
    this.main.funcs.wsocket_remove();
    if(!force)
      this.toastShow(this.text('err401'));

    this.link('/');
  },

  wsocket_create() {

    this.main.funcs.wsocket_remove();
    if(!this.main.data._token)
      return;

    this.main.dataws.wsocket = new WebSocket(((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + `${this.main.data.backend_ws}/ws_notices?accessToken=${encodeURIComponent(this.main.data._token)}`);
    this.main.dataws.wsocket.onmessage = e => {
      if(e.data === 'PONG') return;
      const d = JSON.parse(e.data);
      if(Object.keys(d).length && this.module === `${d.m}_list`) this.funcs.reload();
    };
    this.main.dataws.wsocket.onerror = e => this.main.dataws.wsocket_tmr = setTimeout(() => this.main.funcs.wsocket_create(), 2000);
  },

  wsocket_send(obj = {}) {

    if(this.main.dataws.wsocket && this.main.dataws.wsocket.readyState === WebSocket.OPEN)
      this.main.dataws.wsocket.send(JSON.stringify({accessToken: this.main.data._token, ...obj}));
  },

  wsocket_remove() {

    if(this.main.dataws.wsocket) {
      this.main.dataws.wsocket.close();
      this.main.dataws.wsocket = null;
      clearTimeout(this.main.dataws.wsocket_tmr);
    }
  },

  buttons(readonly, nocancel) {

    return '<div class="tc">' +
      ((readonly) ?	`<button class="button"><i class="fa-solid fa-caret-left"></i> <span>{{ this.text('back') }}</span></button>` :
	`<div style="width: 24px" class="ib">&nbsp;</div>` +
	`<input id="bttSubmit" type="submit" :value="{{ this.text('ok') }}" class="button">` +
	` <div id="idLoader" class="loader1" style="--size: 24px; visibility: hidden"></div> `+
	((nocancel) ? '' : `<input id="frmReset" type="reset" :value="{{ this.text('cancel') }}" class="button">`)) +
	'</div>';
  },

  sort(m, s, obj) {

    const cs = m.data.sort.substring(1), asc = (s !== cs || m.data.sort.substring(0, 1) === '-');
    if(cs !== s && cs)
      this.e(`sort_${cs}`).className = 'fa-solid fa-sort fa-fw';

    this.e(`sort_${s}`).className = 'fa-solid fa-sort-' + ((asc) ? 'down' : 'up') + ' fa-fw';
    m.data.sort = ((asc) ? '+' : '-') + s;
    m.data[obj] = m.data[obj].sort((a, b) => (asc) ? a[s] > b[s] : a[s] < b[s]);
  },

  chk(v) {
    return (v) ? '<i class="fa-solid fa-check"></i>' : '&nbsp;';
  },

  records(value, template) {
    let fldv = (value) ? 'this.data.record.type' : 'this.data.selType', s = '<br><div class="tc">';
    value = (value || '').split(' ');
    for(let type in this.main.data.types) {
      let n = 0, td = this.main.data.types[type];
      s+= `<div id="frecord_${type}" data-jpau-if="${fldv} === '${type}'">`;
      for(let fld in td) {
	let name = fld.charAt(0).toUpperCase() + fld.slice(1), v = (value[n] && this.data.record.type === type) ? value[n] : '';
	v = (v) ? `value="${v}"` : '';
	s+= `<div class="ib vt" style="padding: 0 2px">${name}<br>`;
	switch(this.main.data.types[type][fld]) {
	  case 'ipv4':
	    s+= `<input type="text" id="rec_${type}_${n}" size="14" maxlength="15" *required="${fldv} === '${type}'" ${v}` + ((template) ? '' : ` pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}\$"`) + ' class="txt">';
	    break;
	  case 'ipv6':
	    s+= `<input type="text" id="rec_${type}_${n}" size="28" maxlength="39" *required="${fldv} === '${type}'" ${v}` + ((template) ? '' : ` pattern="^(([0-9a-fA-F]{1,4})*:){1,7}[0-9a-fA-F]{1,4}\$"`) + ' class="txt">';
	    break;
	  case 'str':
	    s+= `<input type="text" id="rec_${type}_${n}" size="16" maxlength="50" *required="${fldv} === '${type}'" ${v} class="txt">`;
	    break;
	  case 'txt':
	    s+= `<textarea id="rec_${type}_${n}" cols="25" rows="2" *required="${fldv} === '${type}'" class="txt">${v}</textarea>`;
	    break;
	  case 'int16':
	    s+= `<input type="number" id="rec_${type}_${n}" size="6" min="0" max="65535" step="1" *required="${fldv} === '${type}'" ${v}  class="txt">`;
	    break;
	  case 'int32':
	    s+= `<input type="number" id="rec_${type}_${n}" size="8" min="0" max="4294967295" step="1" *required="${fldv} === '${type}'" ${v} class="txt">`;
	    break;
	  default:
	    s+= `<select id="rec_${type}_${n}" class="txt"><option data-jpau-for="for(let tv in this.main.data.types.${type}.${fld})" :value="{{ tv }}"` + ((value[n]) ? `  *selected="'${value[n]}'"` : '') + `>{{ this.main.data.types.${type}.${fld}[tv] }}</option></select>`;
	    break;
	}
	n++;
	s+= '</div>';
      }
      s+= '</div>';
    }
    return `${s}</div>`;
  },

  recordfrm() {
    let s = [], t = this.e('type').value, ts = this.main.data.types[t], n = Object.keys(ts).length;
    for(let i = 0; i < n; ++i)
      s.push(this.e(`rec_${t}_${i}`).value);
    return s.join(' ');
  }
};

export const langs = [
  {code: 'en-US', default: 'en', name: '🇬🇧 English'},
  {code: 'es-ES', default: 'es', name: '🇪🇸 Español'},
  {code: 'fr-FR', default: 'fr', name: '🇫🇷 Français'},
  {code: 'de-DE', default: 'de', name: '🇩🇪 Deutsch'},
  {code: 'it-IT', default: 'it', name: '🇮🇹 Italiano'},
  {code: 'pt-PT', default: 'pt', name: '🇵🇹 Português'},
  {code: 'zh-CN', default: 'ch', name: '🇨🇳 中文'}
];

export const texts = {
  'en-US': {	ok: 'Ok',
		cancel: 'Cancel',
		deleteAsk: '❌ Delete?',
		uploadLargeMsg: '⛔ Maximum file size is 10 Mb',
		err400: 'Bad Request',
		err401: 'You must login',
		err403: 'You have not permissions',
		err404: 'Not found',
		created: 'Created',
		updated: 'Updated',
		deleted: 'Deleted',
		back: 'Back',
		new: 'New',
		already_exists: 'Already exists with same name',
		domains: 'Domains',
		records: 'Records',
		templates: 'Templates',
		template: 'Template',
		users: 'Users',
		password: 'Password',
		code: 'Code',
		name: 'Name',
		date: 'Date',
		type: 'Type',
		content: 'Content',
		description: 'Description',
		ttl: 'TTL',
		prio: 'Priority',
		no_ip: 'No-IP',
		disabled: 'Disabled',
		default: 'Default',
		admin: 'Admin',
		readonly: 'Readonly',
		image: 'Image'
  },
  'es-ES': {	ok: 'Aceptar',
		cancel: 'Cancelar',
		deleteAsk: '❌ ¿Eliminar?',
		uploadLargeMsg: '⛔ El tamaño máximo es 10 Mb',
		err400: 'Petición no válida',
		err401: 'Debes identificarte',
		err403: 'No tienes permisos',
		err404: 'No encontrado',
		created: 'Creado',
		updated: 'Actualizado',
		deleted: 'Eliminado',
		back: 'Volver',
		new: 'Nuevo',
		already_exists: 'Ya existe con el mismo nombre',
		domains: 'Dominios',
		records: 'Registros',
		templates: 'Plantillas',
		template: 'Plantilla',
		users: 'Usuarios',
		password: 'Contraseña',
		code: 'Código',
		name: 'Nombre',
		date: 'Fecha',
		type: 'Tipo',
		content: 'Contenido',
		description: 'Descripción',
		ttl: 'TTL',
		prio: 'Prioridad',
		no_ip: 'No-IP',
		disabled: 'Desactivado',
		default: 'Por defecto',
		admin: 'Administrador',
		readonly: 'Solo lectura',
		image: 'Imagen'
  },
  'fr-FR': {	ok: 'Ok',
		cancel: 'Annuler',
		deleteAsk: '❌ Supprimer?',
		uploadLargeMsg: '⛔ La taille maximale du fichier est de 10 Mb',
		err400: 'Mauvaise demande',
		err401: 'Vous devez vous connecter',
		err403: 'Vous n\'avez pas de droits d\'accès',
		err404: 'Pas trouvé',
		created: 'Créé',
		updated: 'Mis à jour',
		deleted: 'Supprimé',
		back: 'Retour',
		new: 'Nouveau',
		already_exists: 'Existe déjà sous le même nom',
		domains: 'Domaines',
		records: 'Enregistrements',
		templates: 'Modèles',
		template: 'Modèles',
		users: 'Utilisateurs',
		password: 'Mot de passe',
		code: 'Code',
		name: 'Nom',
		date: 'Date',
		type: 'Type',
		content: 'Contenu',
		description: 'Description',
		ttl: 'TTL',
		prio: 'Priorité',
		no_ip: 'No-IP',
		disabled: 'Désactivé',
		default: 'Par défaut',
		admin: 'Admin',
		readonly: 'Lecture seule',
		image: 'Image'
  },
  'de-DE': {	ok: 'Ok',
		cancel: 'Abbrechen',
		deleteAsk: '❌ Löschen?',
		uploadLargeMsg: '⛔ Maximale Dateigröße ist 10 Mb',
		err400: 'Schlechte Anfrage',
		err401: 'Sie müssen sich anmelden',
		err403: 'Sie haben keine Berechtigung',
		err404: 'Nicht gefunden',
		created: 'Erstellt',
		updated: 'Aktualisiert',
		deleted: 'Gelöscht',
		back: 'Zurück',
		new: 'Neu',
		already_exists: 'Existiert bereits unter demselben Namen',
		domains: 'Domänen',
		records: 'Datensätze',
		templates: 'Vorlagen',
		template: 'Vorlage',
		users: 'Benutzer',
		password: 'Kennwort',
		code: 'Code',
		name: 'Name',
		date: 'Datum',
		type: 'Typ',
		content: 'Inhalt',
		description: 'Beschreibung',
		ttl: 'TTL',
		prio: 'Priorität',
		no_ip: 'No-IP',
		disabled: 'Deaktiviert',
		default: 'Standard',
		admin: 'Verwaltung',
		readonly: 'Schreibgeschützt',
		image: 'Bild'
  },
  'it-IT': {	ok: 'Ok',
		cancel: 'Annullamento',
		deleteAsk: '❌ Cancellare?',
		uploadLargeMsg: '⛔ La dimensione massima del file è di 10 Mb',
		err400: 'Richiesta errata',
		err401: 'Devi effettuare il login',
		err403: 'Non hai i permessi',
		err404: 'Non trovato',
		created: 'Creato',
		updated: 'Aggiornato',
		deleted: 'Eliminato',
		back: 'Torna',
		new: 'Nuovo',
		already_exists: 'Esiste già con lo stesso nome',
		domains: 'Domini',
		records: 'Registri',
		templates: 'Modelli',
		template: 'Modello',
		users: 'Utenti',
		password: 'Password',
		code: 'Codice',
		name: 'Nome',
		date: 'Data',
		type: 'Tipo',
		content: 'Contenuto',
		description: 'Descrizione',
		ttl: 'TTL',
		prio: 'Priorità',
		no_ip: 'No-IP',
		disabled: 'Disabilitato',
		default: 'Predefinito',
		admin: 'Amministrazione',
		readonly: 'Solo lettura',
		image: 'Immagine'
  },
  'pt-PT': {	ok: 'Ok',
		cancel: 'Cancelar',
		deleteAsk: '❌ Apagar?',
		uploadLargeMsg: 'O tamanho máximo do ficheiro é de 10 Mb',
		err400: 'Mau pedido',
		err401: 'É necessário fazer login',
		err403: 'Não tem permissões',
		err404: 'Não encontrado',
		created: 'Criado',
		updated: 'Atualizado',
		deleted: 'Apagado',
		back: 'Voltar',
		new: 'Novo',
		already_exists: 'Já existe com o mesmo nome',
		domains: 'Domínios',
		records: 'Registos',
		templates: 'Modelos',
		template: 'Modelos',
		users: 'Utilizadores',
		password: 'Palavra-passe',
		code: 'Código',
		name: 'Nome',
		date: 'Data',
		type: 'Tipo',
		content: 'Conteúdo',
		description: 'Descrição',
		ttl: 'TTL',
		prio: 'Prioridade',
		no_ip: 'Não-IP',
		disabled: 'Desativado',
		default: 'Predefinição',
		admin: 'Admin',
		readonly: 'Apenas leitura',
		image: 'Imagem'
  },
  'zh-CN': {	ok: '好的',
		cancel: '取消',
		deleteAsk: '❌ 删除？',
		uploadLargeMsg: '⛔ 最大文件大小为 10 Mb',
		err400: '坏请求',
		err401: '您必须登录',
		err403: '你没有权限',
		err404: '未找到',
		created: '已创建',
		updated: '已更新',
		deleted: '删除',
		back: '返回',
		new: '新',
		already_exists: '已存在同名文件',
		domains: '域名',
		records: '记录',
		templates: '模板',
		template: '模板',
		users: '用户',
		password: '密码',
		code: '密码',
		name: '用户名',
		date: '日期',
		type: '类型',
		content: '内容',
		description: '说明',
		ttl: 'TTL',
		prio: '优先级',
		no_ip: '无 IP',
		disabled: '禁用',
		default: '默认',
		admin: '管理',
		readonly: '只读',
		image: '图像'
  }
};
