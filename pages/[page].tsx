import { Context, Props } from "../typescript/pages";
import React, { useEffect, useState } from "react";

import RenderComponents from "../components/render-components";
import Skeleton from "react-loading-skeleton";
import { getPageRes } from "../helper";
import { onEntryChange } from "../contentstack-sdk";

export default function Page(props: Props) {
  const { page, entryUrl } = props;
  const [getEntry, setEntry] = useState(page);

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
    onEntryChange(() => fetchData());
  }, [page]);

  return getEntry.page_components ? (
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
    // console.log("params", params);
    // const entryUrl = params.page.includes("/") ? params.page : `/${params.page}`;
    // console.log("entryUrl", entryUrl);
    let url = context.resolvedUrl;
    if (url.includes("?")) {
      url = url.split("?")[0];
    }
    if (!url.includes("/")) {
      url = `/${url}`;
    }
    console.log("url", url);
    // const entryRes = await getPageRes(url);
    // if (!entryRes) throw new Error("404");
    return {
      props: {
        entryUrl: url,
        page: {}, //entryRes,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
