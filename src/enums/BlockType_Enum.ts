export enum BlockType_Enum {
    Paragraph = 1,
    Heading = 2,
    Attachment = 3,
    Quote = 4,
    Code = 5
}

export const blockTypeEnumObject: Record<number, string> = {
    [BlockType_Enum.Paragraph]: 'پاراگراف',
    [BlockType_Enum.Heading]: 'عنوان',
    [BlockType_Enum.Attachment]: 'پیوست',
    [BlockType_Enum.Quote]: 'نقل‌قول',
    [BlockType_Enum.Code]: 'کد'
};