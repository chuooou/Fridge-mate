export class ApiError extends Error {
 constructor(message:string,public status:number,public code:string,public fieldErrors?:Record<string,string>) {super(message);this.name='ApiError'}
}
export function messageOf(error:unknown) {return error instanceof Error ? error.message : '요청을 처리하지 못했어요. 다시 시도해주세요.'}
