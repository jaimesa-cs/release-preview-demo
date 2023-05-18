import { Context, Props } from "../typescript/pages";
import React, { useEffect, useState } from "react";
import { onEntryChange, stack } from "../contentstack-sdk";

import ReleasePreview from "@contentstack/delivery-plugin-release-preview";
import RenderComponents from "../components/render-components";
import Skeleton from "react-loading-skeleton";
import { getPageRes } from "../helper";
import { getReleasePreviewSession } from "../contentstack-sdk/release-preview/release-preview-plugin";
import { useRouter } from "next/router";

export default function Home(props: Props) {
  const { page, entryUrl } = props;

  const [getEntry, setEntry] = useState(page);
  const [isReleaseLoading, setReleaseLoading] = useState(true);
  const router = useRouter();
  async function fetchData() {
    try {
      const entryRes = await getPageRes(entryUrl);
      if (!entryRes) throw new Error("Status code 404");
      setEntry(entryRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    (async () => {
      setReleaseLoading(true);
      const release_preview_options = getReleasePreviewSession(router.query);
      if (release_preview_options && release_preview_options.enabled) {
        console.log("Release preview options", release_preview_options);
        await ReleasePreview.init(stack, release_preview_options);
        fetchData();
      }
      setReleaseLoading(false);
    })();
  }, []);

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, []);

  return getEntry ? (
    <RenderComponents
      pageComponents={getEntry.page_components}
      contentTypeUid="page"
      entryUid={getEntry.uid}
      locale={getEntry.locale}
    />
  ) : (
    <Skeleton count={3} height={300} />
  );
}

export async function getServerSideProps(context: Context) {
  try {
    // console.log("CONTEXT", context);
    let url = context.resolvedUrl;
    if (url.includes("?")) {
      url = url.split("?")[0];
    }
    if (!url.includes("/")) {
      url = `/${url}`;
    }

    const entryRes = await getPageRes(url);
    return {
      props: {
        entryUrl: url,
        page: entryRes,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
