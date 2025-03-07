import { Plugin } from "@elizaos/core";
import { getChongChiDinhThuocAction } from "./actions/getChongChiDinhThuocAction";
export const ehisPlugin: Plugin = {
    name: "ehis",
    description: "Ehis's Plugin for Eliza",
    actions: [getChongChiDinhThuocAction],
    evaluators: [],
    providers: [],
};

export default ehisPlugin;