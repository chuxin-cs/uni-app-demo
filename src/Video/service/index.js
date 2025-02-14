import fetch from 'src/base/utils/fetch';

export const queryOnlineAndACCByStation = (params) => fetch(`/device-manage/video/queryOnlineAndACC`, {params});

export const queryOnlineAndACC = (params) => fetch(`/device-manage/video/queryVehicleOnlineAndACC`, {params});
