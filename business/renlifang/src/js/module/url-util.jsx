import Util from 'nova-utils';

const URL_CONFIG = {
    "renlifang-profile": "/renlifang/profile.html"
}

function getEntityId() {
    return BASE64.decoder(Util.getURLParameter('entityid') || '')
}

function getEntityType() {
    return BASE64.decoder(Util.getURLParameter('entitytype') || '')
}

function openRlfProfile(entityId, entityType, newTab) {
    entityId = entityId == undefined ? '' : (entityId.toString());
    entityType = entityType == undefined ? '' : (entityType.toString());

    openUrl('renlifang-profile', {
        entityid: BASE64.encoder(entityId),
        entitytype: BASE64.encoder(entityType)
    }, newTab);
}

function buildUrl(pageName, pageParams) {
    let url = URL_CONFIG[pageName];

    if(!_.isEmpty(pageParams)) {
        let params = [];
        _.each(pageParams, (value, key)=>{
             params.push(key + '=' + value);
        });
        params = params.join('&');
        url += '?' + params;
    }

    return encodeURI(url);
}

function getProfileUrl(entityId, entityType, newTab) {
    entityId = entityId == undefined ? '' : (entityId.toString());
    entityType = entityType == undefined ? '' : (entityType.toString());

    return buildUrl('renlifang-profile', {
        entityid: BASE64.encoder(entityId),
        entitytype: BASE64.encoder(entityType)
    });
}

function openUrl(pageName, pageParams, newTab=false){
    window.open(buildUrl(pageName, pageParams), newTab ? "_blank" : "_search");
}

window.UrlUtil = {
    getEntityId, getEntityType, buildUrl, openUrl, openRlfProfile, getProfileUrl
}