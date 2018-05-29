import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('RootUserStore')
class RootUserStore {

}

const rootUserStore = new RootUserStore();

export default rootUserStore;
