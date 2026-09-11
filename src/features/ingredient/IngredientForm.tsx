import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { createIngredient, estimateExpiry, getCatalog } from './api'
import { dateSchema } from './schemas'
import { todayLocal } from './expiry'
import type { CreateIngredientInput } from './types'
import { ApiError, messageOf } from '../../shared/api/errors'
import { Icon } from '../../shared/ui/Icon'

const formSchema = z.object({
  name: z.string().trim().min(1, '재료명을 입력해 주세요.').max(50, '50자 이내로 입력해 주세요.'),
  standardIngredientId: z.string(),
  quantity: z.number({ error: '수량을 입력해 주세요.' }).positive('0보다 큰 수량을 입력해 주세요.').finite(),
  unit: z.string().trim().min(1, '단위를 입력해 주세요.').max(10, '10자 이내로 입력해 주세요.'),
  storage: z.enum(['fridge', 'freezer']),
  registeredOn: dateSchema.refine((date) => date <= todayLocal(), '등록 날짜는 오늘 이후일 수 없어요.'),
  kind: z.enum(['estimated', 'useBy', 'bestBefore']),
  estimateMode: z.enum(['automatic', 'manual', 'none']),
  manualDate: z.string(),
  actualDate: z.string(),
}).superRefine((value, ctx) => {
  if (value.kind !== 'estimated' && !dateSchema.safeParse(value.actualDate).success) ctx.addIssue({ code: 'custom', path: ['actualDate'], message: '올바른 날짜를 선택해 주세요.' })
  if (value.kind === 'estimated' && value.estimateMode === 'manual' && !dateSchema.safeParse(value.manualDate).success) ctx.addIssue({ code: 'custom', path: ['manualDate'], message: '올바른 예상 날짜를 선택해 주세요.' })
})
type FormValues = z.infer<typeof formSchema>

export function IngredientForm() {
  const { user, runtime } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', standardIngredientId: '', quantity: 1, unit: '개', storage: 'fridge', registeredOn: todayLocal(), kind: 'estimated', estimateMode: 'automatic', manualDate: '', actualDate: '' },
  })
  const [standardIngredientId, storage, registeredOn, kind, estimateMode, manualDate, actualDate] = useWatch({ control: form.control, name: ['standardIngredientId', 'storage', 'registeredOn', 'kind', 'estimateMode', 'manualDate', 'actualDate'] })
  const epoch = runtime.getEpoch()
  const catalog = useQuery({ queryKey: ['ingredient-catalog', user!.id], queryFn: ({ signal }) => getCatalog(signal), meta: { epoch } })
  const canEstimate = !!standardIngredientId && dateSchema.safeParse(registeredOn).success && registeredOn <= todayLocal()
  const estimate = useQuery({
    queryKey: ['expiry-preview', user!.id, standardIngredientId, storage, registeredOn],
    queryFn: ({ signal }) => estimateExpiry({ standardIngredientId, storage, registeredOn }, signal),
    enabled: kind === 'estimated' && estimateMode === 'automatic' && canEstimate,
    meta: { epoch },
    staleTime: 0,
  })
  const dateValue = estimateMode === 'automatic' ? (canEstimate ? estimate.data?.date ?? '' : '') : manualDate
  const awaitingEstimate = kind === 'estimated' && estimateMode === 'automatic' && canEstimate && (estimate.isPending || estimate.isFetching || estimate.isError)
  const selectedDate = kind === 'estimated' ? dateValue : actualDate
  const fieldError = (name: keyof FormValues) => form.formState.errors[name]?.message
  const changeKind = (value: FormValues['kind']) => {
    form.setValue('kind', value)
    form.setValue('actualDate', '')
    form.setValue('manualDate', '')
    form.setValue('estimateMode', 'automatic')
    form.clearErrors(['actualDate', 'manualDate'])
  }
  async function submit(values: FormValues) {
    if (awaitingEstimate) return
    setError('')
    const currentEpoch = runtime.getEpoch()
    const input: CreateIngredientInput = {
      name: values.name,
      standardIngredientId: values.standardIngredientId || null,
      quantity: values.quantity,
      unit: values.unit,
      storage: values.storage,
      registeredOn: values.registeredOn,
      actualExpiry: values.kind === 'estimated' ? null : { date: values.actualDate, kind: values.kind },
      estimateInput: values.kind !== 'estimated' || values.estimateMode === 'none' ? { mode: 'none' }
        : values.estimateMode === 'manual' ? { mode: 'manual', date: values.manualDate } : { mode: 'automatic' },
    }
    try {
      const item = await createIngredient(input)
      if (currentEpoch !== runtime.getEpoch()) return
      await runtime.client.invalidateQueries({ queryKey: ['fridge', user!.id] })
      if (currentEpoch !== runtime.getEpoch()) return
      const changed = values.kind === 'estimated' && values.estimateMode === 'automatic' && item.estimatedExpiry?.date !== estimate.data?.date
      navigate('/fridge', { state: { notice: changed ? '재료를 등록했어요. 최신 기준으로 예상 날짜가 갱신됐어요.' : '새로운 재료를 냉장고에 담았어요.' } })
    } catch (failure) {
      if (currentEpoch !== runtime.getEpoch()) return
      if (failure instanceof ApiError && failure.status === 401) { runtime.expire(); return }
      setError(messageOf(failure))
    }
  }
  return <form className="ingredient-form" onSubmit={form.handleSubmit(submit)} noValidate>
    <section className="form-section">
      <div className="section-label"><span>01</span><h2>어떤 재료인가요?</h2></div>
      <div className="field"><label htmlFor="ingredient-name">재료명</label><input id="ingredient-name" placeholder="예: 집에서 가져온 양파" {...form.register('name')} aria-invalid={!!fieldError('name')} aria-describedby="name-error" /><span id="name-error" className="field-error">{fieldError('name')}</span></div>
      <div className="field"><label htmlFor="standard">계산 기준 재료 <span className="optional">선택</span></label><select id="standard" {...form.register('standardIngredientId')} disabled={catalog.isPending || catalog.isError}><option value="">직접 입력한 이름만 사용</option>{catalog.data?.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><p className="field-hint">예상 보관기한을 계산할 때 사용할 재료를 골라주세요.</p>
        {catalog.isError && <div className="notice error" role="alert">계산 기준을 불러오지 못했어요. 직접 날짜를 고를 수 있어요. <button type="button" className="text-button" onClick={() => void catalog.refetch()}>다시 시도</button></div>}
      </div>
      <div className="form-row"><div className="field"><label htmlFor="quantity">수량</label><input id="quantity" type="number" inputMode="decimal" min="0.01" step="any" {...form.register('quantity', { valueAsNumber: true })} aria-invalid={!!fieldError('quantity')} aria-describedby="quantity-error" /><span id="quantity-error" className="field-error">{fieldError('quantity')}</span></div><div className="field"><label htmlFor="unit">단위</label><input id="unit" placeholder="개, g, 봉지…" {...form.register('unit')} aria-invalid={!!fieldError('unit')} aria-describedby="unit-error" /><span id="unit-error" className="field-error">{fieldError('unit')}</span></div></div>
    </section>
    <section className="form-section">
      <div className="section-label"><span>02</span><h2>어떻게 보관하나요?</h2></div>
      <div className="form-row"><div className="field"><label htmlFor="storage">보관 위치</label><select id="storage" {...form.register('storage')}><option value="fridge">냉장</option><option value="freezer">냉동</option></select></div><div className="field"><label htmlFor="registered">등록 날짜</label><input id="registered" type="date" max={todayLocal()} {...form.register('registeredOn')} aria-invalid={!!fieldError('registeredOn')} aria-describedby="registered-error" /><span id="registered-error" className="field-error">{fieldError('registeredOn')}</span></div></div>
    </section>
    <section className="form-section">
      <div className="section-label"><span>03</span><h2>언제까지 보관할까요?</h2></div>
      <div className="field"><label htmlFor="expiry-kind">기한 종류</label><select id="expiry-kind" value={kind} onChange={(event) => changeKind(event.target.value as FormValues['kind'])}><option value="estimated">예상 보관기한</option><option value="useBy">소비기한</option><option value="bestBefore">유통기한</option></select></div>
      {kind === 'estimated' ? <div className="estimate-panel">
        <div className="estimate-heading"><Icon name="clock" /><strong>예상 보관기한</strong><span className="pill">{estimateMode === 'manual' ? '사용자 지정' : '예상'}</span></div>
        <div className="field"><label htmlFor="estimated-date">예상 날짜</label><input id="estimated-date" type="date" value={dateValue} onChange={(event) => { form.setValue('manualDate', event.target.value, { shouldValidate: true }); form.setValue('estimateMode', event.target.value ? 'manual' : 'none') }} aria-invalid={!!fieldError('manualDate')} aria-describedby="estimate-help estimate-error" /><span id="estimate-error" className="field-error">{fieldError('manualDate')}</span></div>
        <p id="estimate-help" className="field-hint">{estimateMode === 'manual' ? '직접 지정한 예상 날짜예요. 실제 소비기한을 확인한 날짜는 아니에요.' : '계산된 날짜가 기본으로 표시돼요. 날짜를 클릭해 직접 바꿀 수 있어요.'}</p>
        {estimateMode === 'automatic' && canEstimate && estimate.isFetching && <p role="status" className="field-hint">예상 날짜를 계산하고 있어요…</p>}
        {estimateMode === 'automatic' && (!canEstimate || (estimate.isSuccess && !estimate.data)) && <p className="field-hint">자동 계산 기준이 없어요. 날짜를 직접 고르거나 기한 없이 저장하세요.</p>}
        {estimateMode === 'automatic' && estimate.isError && <p role="alert" className="notice error">예상 날짜를 계산하지 못했어요. <button type="button" className="text-button" onClick={() => void estimate.refetch()}>다시 시도</button></p>}
        <div className="estimate-actions"><button className="text-button" type="button" onClick={() => { form.setValue('estimateMode', 'automatic'); form.setValue('manualDate', ''); form.clearErrors('manualDate'); if (canEstimate) void estimate.refetch() }}>자동 예상 기한으로 되돌리기</button><button className="text-button muted" type="button" onClick={() => { form.setValue('estimateMode', 'none'); form.setValue('manualDate', ''); form.clearErrors('manualDate') }}>기한 없이 저장하기</button></div>
        <p className="estimate-disclaimer">예상 기한은 실제 상태와 보관 환경에 따라 달라질 수 있어요.{import.meta.env.DEV && ' 현재 자동 계산은 개발용 예시 기준이에요.'}</p>
      </div> : <div className="field"><label htmlFor="actual-date">{kind === 'useBy' ? '소비기한 날짜' : '유통기한 날짜'}</label><input id="actual-date" type="date" {...form.register('actualDate')} aria-invalid={!!fieldError('actualDate')} aria-describedby="actual-error" /><span id="actual-error" className="field-error">{fieldError('actualDate')}</span><p className="field-hint">포장지에서 확인한 날짜를 입력해 주세요.</p></div>}
      {selectedDate && selectedDate < todayLocal() && <p role="status" className="notice warning">이미 지난 날짜예요. 재료의 상태와 날짜를 다시 확인해 주세요.</p>}
    </section>
    {error && <p role="alert" className="notice error">{error}</p>}
    <div className="form-footer"><Link className="button secondary" to="/fridge">취소</Link><button className="button primary" disabled={form.formState.isSubmitting || awaitingEstimate}>{form.formState.isSubmitting ? '등록하는 중…' : '냉장고에 추가'}<Icon name="plus" /></button></div>
  </form>
}
