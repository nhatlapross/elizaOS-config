import { ActionExample } from "@elizaos/core";

export const getChongChiDinhThuoc: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Kiểm tra tương tác thuốc giữa hoạt chất 1 Domperidon và hoạt chất 2 Methadon"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Tôi sẽ kiểm tra tương tác thuốc giữa Domperidon và Methadon cho bạn.",
                action: "GET_CHONG_CHI_DINH_THUOC"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Tôi muốn kiểm tra tương tác của hoạt chất Amiodarone với Fluconazole"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Tôi sẽ kiểm tra tương tác thuốc giữa Amiodarone và Fluconazole cho bạn.",
                action: "GET_CHONG_CHI_DINH_THUOC"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cho tôi biết thông tin về hoạt chất Warfarin"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Tôi sẽ tìm thông tin về các tương tác thuốc liên quan đến Warfarin cho bạn.",
                action: "GET_CHONG_CHI_DINH_THUOC"
            }
        }
    ]
];

export const getDiaChiLienHe: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Tôi có thể liên hệ với bạn thế nào."
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Địa chỉ liên hệ 20 đường số 11 phường 10 Gò Vấp HCM, số điện thoại liên hệ 0901234567.",
                action: "GET_DIA_CHI"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Cho tôi địa chỉ liên hệ"
            }
        },
        {
            user: "{{agent}}",
            content: {
                text: "Địa chỉ liên hệ 20 đường số 11 phường 10 Gò Vấp HCM, số điện thoại liên hệ 0901234567.",
                action: "GET_DIA_CHI"
            }
        }
    ]
];