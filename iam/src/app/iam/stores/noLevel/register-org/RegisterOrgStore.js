import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    const newConfig = config;
    newConfig.headers['Content-Type'] = 'application/json';
    newConfig.headers.Accept = 'application/json';
    const accessToken = Choerodon.getAccessToken();
    if (accessToken) {
      newConfig.headers.Authorization = accessToken;
    }
    return newConfig;
  },
  (err) => {
    const error = err;
    return Promise.reject(error);
  },
);

instance.interceptors.response.use((res) => {
  return res.data;
}, (error) => {
  window.console.log(error);
});

@store('RegisterOrgStore')
class RegisterOrgStore {
  checkCode = value => instance.post('/iam/v1/organizations/check', JSON.stringify({ code: value }));

  checkLoginrname = loginName => instance.post('/iam/v1/users/check', JSON.stringify({ loginName }));

  checkEmailAddress = email => instance.post('/iam/v1/users/check', JSON.stringify({ email }));

  sendCaptcha = email => instance.get(`/org/v1/organizations/send/email_captcha/?email=${email}`);
}

const registerOrgStore = new RegisterOrgStore();

export default registerOrgStore;
