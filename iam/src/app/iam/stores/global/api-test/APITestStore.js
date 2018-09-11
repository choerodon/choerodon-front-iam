/**
 * Created by hulingfangzi on 2018/7/9.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('ApitestStore')
class ApitestStore {
  @observable service = [];
  @observable currentService = {};
  @observable currentVersion = {};
  @observable versions = ['asdasd', 'asd'];
  @observable apiData = [];
  @observable isShowModal = false;
  @observable detailFlag = false;
  @observable apitoken = null;
  @observable loading = true;
  @observable modalSaving = false;
  @observable userInfo = null;
  @observable isShowResult = null;
  @observable isExpand = new Map();
  @observable apiDetail = {
    description: '[]',
    responses: [],
  };
  @observable initData = null; // 用来缓存APITest列表页的state实现打开新的page然后返回仍在离开时的分页

  @action setDetailFlag(flag) {
    this.detailFlag = flag;
  }

  @action setIsExpand(flag, name) {
    this.isExpand.set(flag, name);
  }

  @action clearIsExpand() {
    this.isExpand = null;
    this.isExpand = new Map();
  }

  @action setVersions(data) {
    this.versions = data;
  }

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setModalSaving(flag) {
    this.modalSaving = flag;
  }

  @action setIsShowResult(flag) {
    this.isShowResult = flag;
  }

  @action setUserInfo(data) {
    this.userInfo = data;
  }

  @action setInitData(data) {
    this.initData = data;
  }

  @computed get getInitData() {
    return this.initData;
  }

  @computed get getUserInfo() {
    return this.userInfo;
  }

  @computed get getIsExpand() {
    return this.isExpand;
  }

  @action setIsShowModal(flag) {
    this.isShowModal = flag;
  }

  @computed get getIsShowModal() {
    return this.isShowModal;
  }

  @action setService(data) {
    this.service = data;
  }

  @action setCurrentService(data) {
    this.currentService = data;
  }

  @action setCurrentVersion(data) {
    this.currentVersion = data;
  }

  @computed get getCurrentService() {
    return this.currentService;
  }

  @computed get getCurrentVersion() {
    return this.currentVersion;
  }

  @action setApiToken(data) {
    this.apitoken = data;
  }

  @computed get getApiToken() {
    return this.apitoken;
  }

  @action setApiData(data) {
    this.apiData = data;
  }

  @computed get getApiData() {
    return this.apiData;
  }

  @action setApiDetail(data) {
    this.apiDetail = data;
  }

  @computed get getApiDetail() {
    return this.apiDetail;
  }

  loadService = () => axios.get('manager/v1/swaggers/resources');
}

const apitestStore = new ApitestStore();
export default apitestStore;
