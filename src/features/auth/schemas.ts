import { z } from 'zod'
export const credentialsSchema = z.object({
 nickname: z.string().trim().min(2,'닉네임은 2자 이상 입력해주세요.').max(20,'닉네임은 20자 이하로 입력해주세요.').regex(/^[가-힣a-zA-Z0-9_]+$/,'한글, 영문, 숫자, 밑줄만 사용할 수 있어요.'),
 password: z.string().min(8,'비밀번호는 8자 이상 입력해주세요.').max(64,'비밀번호는 64자 이하로 입력해주세요.'),
})
