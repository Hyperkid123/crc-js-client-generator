import GlobalInstance from '../globalInstance'

interface GetPrincipalAccessParameters {
 /** The application name(s) to obtain access for the principal. This is an exact match. When no application is supplied, all permissions for the principal are returned. You may also use a comma-separated list to match on multiple applications. */
  application: string
 /** Unique username of the principal to obtain access for (only available for admins, and if supplied, takes precedence over the identity header). */
  username?: string
 /** Parameter for selecting the amount of data returned. */
  limit?: number
 /** Parameter for selecting the offset of data. */
  offset?: number
};

async function getData(parameters: GetPrincipalAccessParameters) {
    return GlobalInstance.getInstance().get("/access/", {params: parameters})
}

export default getData
