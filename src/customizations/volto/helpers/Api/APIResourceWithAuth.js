/**
 * Sitemap helper.
 * @module helpers/Sitemap
 */

import superagent from 'superagent';
import config from '@plone/volto/registry';
import { addHeadersFactory } from '@plone/volto/helpers/Proxy/Proxy';

/**
 * Get a resource image/file with authenticated (if token exist) API headers
 * @function getAPIResourceWithAuth
 * @param {Object} req Request object
 * @return {string} The response with the image
 */
export const getAPIResourceWithAuth = (req) =>
  new Promise((resolve, reject) => {
    const { settings } = config;
    const APISUFIX = settings.legacyTraverse ? '' : '/++api++';
    const prefix = settings.prefixPath;
    let apiPath = '';

    if (settings.internalApiPath && __SERVER__) {
      apiPath = settings.internalApiPath;
    } else if (__DEVELOPMENT__ && settings.devProxyToApiPath) {
      apiPath = settings.devProxyToApiPath;
    } else {
      apiPath = settings.apiPath;
    }

    let path = req.path;
    if (prefix && path.match(new RegExp(`^${prefix}(/|$)`))) {
      //if path starts with prefixPath
      path = path.replace(new RegExp(`^(${prefix})+`), '');
    }
    const request = superagent
      .get(`${apiPath}${__DEVELOPMENT__ ? '' : APISUFIX}${path}`)
      .maxResponseSize(settings.maxResponseSize)
      .responseType('blob');
    const authToken = req.universalCookies.get('auth_token');
    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }
    request.use(addHeadersFactory(req));
    request.then(resolve).catch(reject);
  });
