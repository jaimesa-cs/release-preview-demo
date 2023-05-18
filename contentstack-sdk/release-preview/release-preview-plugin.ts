import * as Contentstack from "contentstack";

import { ContentstackPlugin, ContentstackRequest, Stack } from "contentstack";
import { releaseReplaceAlgorithm, releaseReplacePreReq } from "@contentstack/delivery-plugin-release-preview";

export const RELEASE_SESSION_KEY = "release_preview_session";
export const getReleasePreviewSession = (searchParams: any) => {
  const tentativeReleases = searchParams.tentativeReleases;
  const release_id = searchParams.release_preview_id;
  const params = {
    enabled: true,
    release_id,
    tentativeReleases: tentativeReleases && JSON.parse(tentativeReleases),
  };
  // const releaseSessionInfo = sessionStorage.getItem(release_session_key);
  // if(release_id || !releaseSessionInfo) {
  //   sessionStorage.setItem(release_session_key, JSON.stringify(params));
  //   return params;
  // }
  // return JSON.parse(releaseSessionInfo);
  return params;
};

export class ReleasePreviewPlugin implements ContentstackPlugin {
  onRequest(stack: Contentstack.Stack, request: ContentstackRequest): ContentstackRequest {
    try {
      releaseReplacePreReq(stack, request);
    } catch (e) {
      console.log("Error", e);
    }
    return request;
  }
  async onResponse(stack: Stack, request: ContentstackRequest, response: any, data: any) {
    // console.log("Response", data);
    const _data = data["entries"] || data["assets"] || data["entry"] || data["asset"];
    // console.log("Data", _data);
    console.log("Exists", releaseReplaceAlgorithm);
    if (releaseReplaceAlgorithm) {
      await releaseReplaceAlgorithm(_data, stack);
    }

    // console.log("Data2", _data);
    return data;
  }
}
