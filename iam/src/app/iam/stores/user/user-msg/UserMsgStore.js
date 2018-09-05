import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

const mockData = [{
  id: 1,
  title: '消息1',
  isRead: true,
  reciveTime: '2018-08-10 11:51:56',
  msg: '<h1>消息1的标题</h1><p>Choerodon 猪齿鱼是一个开源企业服务平台，是基于 Kubernetes 的容器编排和管理能力，整合 DevOps 工具链、微服务和移动应用框架，来帮助企业实现敏捷化的应用交付和自动化的运营管理，并提供 IoT、支付、数据、智能洞察、企业应用市场等业务组件，来帮助企业聚焦于业务，加速数字化转型。 Choerodon 使用 Kubernetes 来管理和部署服务。关于 Kubernetes，请参考 Kubernetes 概览。 同时，Choerodon 使用 Spring Cloud 作为微服务分布式系统，并且 Choerodon 还使用 Spring Boot 进行了通用性模块的封装，例如组织管理、用户管理、权限管理等；前端使用 React 作为开发组件。关于 Choerodon 的开发请参考 Choerodon 猪齿鱼微服务开发框架 开发。 有关 Choerodon 组件的详细概念信息，请参阅我们的其他概念指南。 为什么要使用 Choerodon ？ Choerodon 解决了开发人员和运维人员面临的许多挑战。随着企业或者组织业务模式不断的互联网化，尤其是对于一些有软件研发能力的公司或者组织，如何有效的应对开发和运维之间的关系，提高IT部门的总体运作效率，以支撑业务的快速发展，已成为了我们面临的重大挑战。 同时，现代企业或者组织对于软件系统的需求，也在随着互联网和大数据等新技术的进步在悄然发生变化，尤其是在数字化转型的思潮中，企业或者组织要求： 零宕机 部署松耦合的组件，通过冗余来避免故障，零停机的情况下完成升级 极短反馈周期 经常发布代码，缩短反馈回路，降低风险 移动和多设备 充分利用移动设备，用户能够在多种设备使用，系统能够适应扩展的需求 设备互联 互联网连接的设备导致数据量剧增和要求“边缘”的计算能力，需要新的软件设计和实践 数据驱动 使用数据，通过更智能的应用向客户提供极致的体验和更高的价值</p>',
}, {
  id: 2,
  title: '消息2',
  isRead: false,
  reciveTime: '2018-08-10 12:56:16',
  msg: '<h1>消息2的标题</h1><p>Choerodon 猪齿鱼是一个开源企业服务平台，是基于 Kubernetes 的容器编排和管理能力，整合 DevOps 工具链、微服务和移动应用框架，来帮助企业实现敏捷化的应用交付和自动化的运营管理，并提供 IoT、支付、数据、智能洞察、企业应用市场等业务组件，来帮助企业聚焦于业务，加速数字化转型。 Choerodon 使用 Kubernetes 来管理和部署服务。关于 Kubernetes，请参考 Kubernetes 概览。 同时，Choerodon 使用 Spring Cloud 作为微服务分布式系统，并且 Choerodon 还使用 Spring Boot 进行了通用性模块的封装，例如组织管理、用户管理、权限管理等；前端使用 React 作为开发组件。关于 Choerodon 的开发请参考 Choerodon 猪齿鱼微服务开发框架 开发。 有关 Choerodon 组件的详细概念信息，请参阅我们的其他概念指南。 为什么要使用 Choerodon ？ Choerodon 解决了开发人员和运维人员面临的许多挑战。随着企业或者组织业务模式不断的互联网化，尤其是对于一些有软件研发能力的公司或者组织，如何有效的应对开发和运维之间的关系，提高IT部门的总体运作效率，以支撑业务的快速发展，已成为了我们面临的重大挑战。 同时，现代企业或者组织对于软件系统的需求，也在随着互联网和大数据等新技术的进步在悄然发生变化，尤其是在数字化转型的思潮中，企业或者组织要求： 零宕机 部署松耦合的组件，通过冗余来避免故障，零停机的情况下完成升级 极短反馈周期 经常发布代码，缩短反馈回路，降低风险 移动和多设备 充分利用移动设备，用户能够在多种设备使用，系统能够适应扩展的需求 设备互联 互联网连接的设备导致数据量剧增和要求“边缘”的计算能力，需要新的软件设计和实践 数据驱动 使用数据，通过更智能的应用向客户提供极致的体验和更高的价值</p>',
}, {
  id: 3,
  title: '消息3',
  isRead: true,
  reciveTime: '2018-08-10 13:57:31',
  msg: '<h1>消息3的标题</h1><p>Choerodon 猪齿鱼是一个开源企业服务平台，是基于 Kubernetes 的容器编排和管理能力，整合 DevOps 工具链、微服务和移动应用框架，来帮助企业实现敏捷化的应用交付和自动化的运营管理，并提供 IoT、支付、数据、智能洞察、企业应用市场等业务组件，来帮助企业聚焦于业务，加速数字化转型。 Choerodon 使用 Kubernetes 来管理和部署服务。关于 Kubernetes，请参考 Kubernetes 概览。 同时，Choerodon 使用 Spring Cloud 作为微服务分布式系统，并且 Choerodon 还使用 Spring Boot 进行了通用性模块的封装，例如组织管理、用户管理、权限管理等；前端使用 React 作为开发组件。关于 Choerodon 的开发请参考 Choerodon 猪齿鱼微服务开发框架 开发。 有关 Choerodon 组件的详细概念信息，请参阅我们的其他概念指南。 为什么要使用 Choerodon ？ Choerodon 解决了开发人员和运维人员面临的许多挑战。随着企业或者组织业务模式不断的互联网化，尤其是对于一些有软件研发能力的公司或者组织，如何有效的应对开发和运维之间的关系，提高IT部门的总体运作效率，以支撑业务的快速发展，已成为了我们面临的重大挑战。 同时，现代企业或者组织对于软件系统的需求，也在随着互联网和大数据等新技术的进步在悄然发生变化，尤其是在数字化转型的思潮中，企业或者组织要求： 零宕机 部署松耦合的组件，通过冗余来避免故障，零停机的情况下完成升级 极短反馈周期 经常发布代码，缩短反馈回路，降低风险 移动和多设备 充分利用移动设备，用户能够在多种设备使用，系统能够适应扩展的需求 设备互联 互联网连接的设备导致数据量剧增和要求“边缘”的计算能力，需要新的软件设计和实践 数据驱动 使用数据，通过更智能的应用向客户提供极致的体验和更高的价值</p>',
}, {
  id: 4,
  title: '消息4',
  isRead: false,
  reciveTime: '2018-08-10 14:26:01',
  msg: '<h1>消息4的标题</h1><p>Choerodon 猪齿鱼是一个开源企业服务平台，是基于 Kubernetes 的容器编排和管理能力，整合 DevOps 工具链、微服务和移动应用框架，来帮助企业实现敏捷化的应用交付和自动化的运营管理，并提供 IoT、支付、数据、智能洞察、企业应用市场等业务组件，来帮助企业聚焦于业务，加速数字化转型。 Choerodon 使用 Kubernetes 来管理和部署服务。关于 Kubernetes，请参考 Kubernetes 概览。 同时，Choerodon 使用 Spring Cloud 作为微服务分布式系统，并且 Choerodon 还使用 Spring Boot 进行了通用性模块的封装，例如组织管理、用户管理、权限管理等；前端使用 React 作为开发组件。关于 Choerodon 的开发请参考 Choerodon 猪齿鱼微服务开发框架 开发。 有关 Choerodon 组件的详细概念信息，请参阅我们的其他概念指南。 为什么要使用 Choerodon ？ Choerodon 解决了开发人员和运维人员面临的许多挑战。随着企业或者组织业务模式不断的互联网化，尤其是对于一些有软件研发能力的公司或者组织，如何有效的应对开发和运维之间的关系，提高IT部门的总体运作效率，以支撑业务的快速发展，已成为了我们面临的重大挑战。 同时，现代企业或者组织对于软件系统的需求，也在随着互联网和大数据等新技术的进步在悄然发生变化，尤其是在数字化转型的思潮中，企业或者组织要求： 零宕机 部署松耦合的组件，通过冗余来避免故障，零停机的情况下完成升级 极短反馈周期 经常发布代码，缩短反馈回路，降低风险 移动和多设备 充分利用移动设备，用户能够在多种设备使用，系统能够适应扩展的需求 设备互联 互联网连接的设备导致数据量剧增和要求“边缘”的计算能力，需要新的软件设计和实践 数据驱动 使用数据，通过更智能的应用向客户提供极致的体验和更高的价值</p>',
},
];

@store('UserMsgStore')
class UserMsgStore {
  @observable userMsg = mockData;

  @observable userInfo = {};

  @observable expandCardId = mockData[0].id;

  @computed
  get getExpandCardId() {
    return this.expandCardId;
  }

  @action
  setExpandCardId(id) {
    this.expandCardId = id;
  }

  @computed
  get getUserMsg() {
    return this.userMsg;
  }

  @action
  setUserMsg(data) {
    this.userMsg = data;
  }

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(data) {
    this.userInfo = data;
  }
}

const userMsgStore = new UserMsgStore();
export default userMsgStore;
