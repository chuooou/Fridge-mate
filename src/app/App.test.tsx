import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { AppProviders } from './providers/AppProviders'
import { App } from './App'
import { server } from '../mocks/server'
import { resetDb } from '../mocks/db'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
beforeEach(() => resetDb())
afterEach(() => server.resetHandlers())

function mount(path = '/login') {
  render(<AppProviders><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></AppProviders>)
}

async function signIn(nickname = 'demo', password = 'fridge1234') {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('닉네임'), nickname)
  await user.type(screen.getByLabelText('비밀번호'), password)
  await user.click(screen.getByRole('button', { name: '로그인' }))
  return user
}

describe('Phase 1 사용자 흐름', () => {
  it('보호 경로에서 로그인 후 원래 재료 등록 화면으로 복귀한다', async () => {
    mount('/ingredients/new')
    await signIn()
    expect(await screen.findByRole('heading', { name: '새로운 재료를 기록해요' })).toBeVisible()
  })

  it('가입, 예상 날짜 직접 변경, 저장, 다른 계정의 빈 목록까지 연결된다', async () => {
    mount('/signup')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('닉네임'), '첫번째')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '회원가입' }))
    await screen.findByRole('heading', { name: '다시 만나 반가워요' })
    await signIn('첫번째', 'password123')
    expect(await screen.findByText('냉장고의 첫 재료를 기다리고 있어요')).toBeVisible()
    await user.click(screen.getByRole('link', { name: '재료 추가' }))
    await user.type(await screen.findByLabelText('재료명'), '집에서 가져온 양파')
    await user.selectOptions(screen.getByLabelText(/계산 기준 재료/), 'onion')
    await waitFor(() => expect(screen.getByLabelText('예상 날짜')).not.toHaveValue(''))
    const date = screen.getByLabelText('예상 날짜')
    // fireEvent is used for a native date input; userEvent does not emulate its picker.
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(date, { target: { value: '2026-12-25' } })
    await user.selectOptions(screen.getByLabelText('보관 위치'), 'freezer')
    expect(date).toHaveValue('2026-12-25')
    await user.click(screen.getByRole('button', { name: '냉장고에 추가' }))
    const card = await screen.findByRole('article', { name: '집에서 가져온 양파' })
    expect(within(card).getByText('사용자 지정')).toBeVisible()
    expect(within(card).getByText('2026.12.25')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    await user.click(await screen.findByRole('link', { name: '회원가입' }))
    await user.type(screen.getByLabelText('닉네임'), '두번째')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '회원가입' }))
    await screen.findByRole('heading', { name: '다시 만나 반가워요' })
    await signIn('두번째', 'password123')
    expect(await screen.findByText('냉장고의 첫 재료를 기다리고 있어요')).toBeVisible()
    expect(screen.queryByText('집에서 가져온 양파')).not.toBeInTheDocument()
  })

  it('틀린 비밀번호는 로그인 폼을 유지하고 복구 가능한 오류를 표시한다', async () => {
    mount()
    await signIn('demo', 'incorrect123')
    expect(await screen.findByRole('alert')).toHaveTextContent(/닉네임|비밀번호/)
    expect(screen.getByLabelText('닉네임')).toHaveValue('demo')
  })
})
