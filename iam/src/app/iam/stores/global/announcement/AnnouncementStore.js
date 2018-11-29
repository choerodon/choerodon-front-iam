import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';
import { handleFiltersParams } from '../../../common/util';

@store('AnnouncementStore')
class AnnouncementStore {
  @observable announcementData = [];
  @observable editorContent = null;
  @observable loading = false;
  @observable submitting = false;
  @observable sidebarVisible = false;
  @observable currentRecord = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable params = [];
  @observable filters = {};
  @observable sort = {};
  @observable announcementType = null;

  @action
  setAnnouncementType(type) {
    this.announcementType = type;
  }

  refresh() {
    this.loadData({ current: 1, pageSize: 10, total: 0 }, {}, {}, []);
  }

  @action
  setSubmitting(flag) {
    this.submitting = flag;
  }

  @action
  setCurrentRecord(record) {
    this.currentRecord = record;
  }

  @action
  showSideBar() {
    this.sidebarVisible = true;
  }

  @action
  hideSideBar() {
    this.sidebarVisible = false;
  }

  @action
  setEditorContent(data) {
    this.editorContent = data;
  }

  @action
  loadData(pagination = this.pagination, filters = this.filters, sort = this.sort, params = this.params) {
    const { columnKey, order } = sort;
    const sorter = [];
    if (columnKey) {
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.loading = true;
    this.filters = filters;
    this.sort = sort;
    this.params = params;
    // 若params或filters含特殊字符表格数据置空
    const isIncludeSpecialCode = handleFiltersParams(params, filters);
    if (isIncludeSpecialCode) {
      this.announcementData.length = 0;
      this.pagination = {
        current: 1,
        pageSize: 10,
        total: 0,
      };
      this.loading = false;
      return;
    }

    return axios.get(`${this.announcementType.apiPrefix}/all?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      content: filters.content && filters.content[0],
      status: filters.status && filters.status[0],
      params: params.join(','),
      sort: sorter.join(','),
    })}`)
      .then(action(({ failed, content, totalElements }) => {
        if (!failed) {
          this.announcementData = content;
          this.pagination = {
            ...pagination,
            total: totalElements,
          };
        }
        this.loading = false;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }

  deleteAnnouncementById = id => axios.delete(`${this.announcementType.apiPrefix}/delete?taskId=${id}`);

  createAnnouncement = data => axios.post(`${this.announcementType.apiPrefix}/create`, JSON.stringify(data));
}

export default new AnnouncementStore();
