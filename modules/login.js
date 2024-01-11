export const data = {
	title: 'JuNeDNS'
};

export const funcs = {
  onMount: async function() {

    if(await this.main.funcs.checkSession())
      this.link('/domains');
  },

  login: async function() {

    const r = await this.main.funcs.send('login', 'POST', 'flogin');
    if(r) {

      localStorage.setItem('token', this.main.data._token);
      this.main.funcs.initSession(r);
      this.link('/domains');

    } else {

      this.shake('flogin');
      this.e('passwd').value = '';
    }
  }
};

export const html = `<br><br>
<div style="width: 320px" class="box">
  <form id="flogin" method="post" @submit="this.funcs.login()">
    <div class="txtgrp"><div><i class="fa-solid fa-user fa-fw"></i></div><input type="text" name="code" maxlength="25" required :placeholder="{{ this.text('code') }}"></div><br>
    <div class="txtgrp"><div><i class="fa-solid fa-lock fa-fw"></i></div><input type="password" id="passwd" name="passwd" maxlength="25" required :placeholder="{{ this.text('password') }}"></div><br>
` + june_pau.main.funcs.buttons(false, true) + `
  </form>
</div>
`;
