// I'm adding a bunch of stuff to the types in case we add any more functionality later
// https://docs.valence.desire2learn.com/res/enroll.html#get--d2l-api-lp-(version)-enrollments-myenrollments-(orgUnitId)-parentOrgUnits
type Item = {
  OrgUnit: Org;
    Access: {
      CanAccess: boolean;
      ClasslistRoleName: string;
      IsActive: boolean;
      LISRoles: string[];
      LastAccessed: string;
      StartDate: null | string;
    };
}
type Org = {
  Code: string;
  HomeUrl: string;
  Id: number;
  ImageUrl: string | null;
  Name: string;
  Type: { Id: number; Code: string; Name: string };
};
type ParentResponse = {
  Items: Item[];
  PagingInfo: {
    HasMoreItems: boolean;
    Bookmark: string;
  };
};

type orgId = string | number;
export default async function checkSupportedOrgs(
  supportedOrgs: orgId[],
  orgId: orgId,
): Promise<boolean> {
  try {
    supportedOrgs = supportedOrgs.map(Number);

    for await (const parent of parentOrgs(orgId)) {
      if (supportedOrgs.includes(parent.OrgUnit.Id)) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error('Error checking supported orgs', e);
    return false;
  }
}

// Using a generator here to avoid loading more pages until we need them.
// It seems unlikely that the hierarchy would be that deep, but who knows.
// This code could be generalized but I don't see why we would need it yet.
async function* parentOrgs(orgId: orgId): AsyncGenerator<Item> {
  let bookmark = '';
  let hasMore = true;

  while (hasMore) {
    const resp = await fetch(
      `/d2l/api/lp/1.53/enrollments/myenrollments/${orgId}/parentOrgUnits?bookmark=${bookmark}`,
    );
    const data = (await resp.json()) as ParentResponse;

    for (const item of data.Items) {
      yield item;
    }

    hasMore = data.PagingInfo.HasMoreItems;
    bookmark = data.PagingInfo.Bookmark;
  }
}
