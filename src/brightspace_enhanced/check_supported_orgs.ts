// I'm adding a bunch of stuff to the types in case we add any more functionality later
type Org = {
  Code: string;
  HomeUrl: string;
  Id: number;
  ImageUrl: string | null;
  Name: string;
  Type: { Id: number; Code: string; Name: string };
};
type ParentResponse = {
  Items: {
    OrgUnit: Org;
    Access: {
      CanAccess: boolean;
      ClasslistRoleName: string;
      IsActive: boolean;
      LISRoles: string[];
      LastAccessed: string;
      StartDate: null | string;
    };
  }[];
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
    const resp = await fetch(
      `/d2l/api/lp/1.46/enrollments/myenrollments/${orgId}/parentOrgUnits`,
    );

    const parents = (await resp.json()) as ParentResponse;
    supportedOrgs = supportedOrgs.map(Number);

    for (const parent of parents.Items) {
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
