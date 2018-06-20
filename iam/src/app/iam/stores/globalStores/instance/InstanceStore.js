/**
 * Created by hulingfangzi on 2018/6/20.
 */
import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
const { AppState } = stores;
import querystring from 'query-string';

@store('InstanceStore')
class InstanceStore {

}

const instanceStore = new InstanceStore();
export default instanceStore;
