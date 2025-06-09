'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

interface Entry {
  id?: string
  type: string
  title: string
  amount: number
}

export default function EditPaymentPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [employees, setEmployees] = useState<any[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [employeeQuery, setEmployeeQuery] = useState('')
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const [month, setMonth] = useState('')
  const [payment, setPayment] = useState<any>(null)

  const [salary, setSalary] = useState('')
  const [certificatePercentage, setCertificatePercentage] = useState('')
  const [riskPercentage, setRiskPercentage] = useState('')
  const [retirePercentage, setRetirePercentage] = useState('')
  const [transPay, setTransPay] = useState('')
  const [note, setNote] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('id, first_name, last_name')
      setEmployees(data || [])
    }
    fetchEmployees()
  }, [])

  useEffect(() => {
    const results = employeeQuery
      ? employees.filter(emp =>
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeQuery.toLowerCase())
        )
      : []
    setFilteredEmployees(results)
  }, [employeeQuery, employees])

  const handleSearch = async () => {
    setError('')
    setMessage('')
    setPayment(null)

    if (!employeeId || !month) {
      setError('يرجى اختيار الموظف والشهر.')
      return
    }

    const formattedMonth = dayjs(`${month}-01`).format('YYYY-MM-DD')
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('month', formattedMonth)
      .single()

    if (error || !data) {
      setError('لم يتم العثور على بيانات الراتب.')
    } else {
      setPayment(data)
      setSalary(data.salary || '')
      setCertificatePercentage(data.certificate_percentage || '')
      setRiskPercentage(data.risk_percentage || '')
      setTransPay(data.trans_pay || '')
      setRetirePercentage(data.retire_percentage || '')
      setNote(data.note || '')

      const { data: entryData } = await supabase
        .from('payments_entries')
        .select('*')
        .eq('payment_id', data.id)

      setEntries(entryData || [])
    }
  }

  const validatePercent = (value: number) => value >= 0 && value <= 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (
      !validatePercent(+certificatePercentage) ||
      !validatePercent(+riskPercentage) ||
      !validatePercent(+retirePercentage)
    ) {
      setError('يرجى التأكد من أن النسب بين 0 و 100')
      return
    }

    const { error } = await supabase
      .from('payments')
      .update({
        salary,
        certificate_percentage: certificatePercentage,
        risk_percentage: riskPercentage,
        trans_pay: transPay,
        retire_percentage: retirePercentage,
        note,
      })
      .eq('id', payment.id)

    if (error) {
      setError('حدث خطأ أثناء تحديث الراتب')
      return
    }

    await supabase.from('payments_entries').delete().eq('payment_id', payment.id)
    const newEntries = entries.map((entry) => ({
      ...entry,
      payment_id: payment.id,
    }))
    await supabase.from('payments_entries').insert(newEntries)

    alert('✅ تم تحديث بيانات الراتب بنجاح.')
    router.back()
  }

  const handleEntryChange = (idx: number, field: keyof Entry, value: any) => {
    const updated = [...entries]
    updated[idx] = { ...updated[idx], [field]: field === 'amount' ? +value : value }
    setEntries(updated)
  }

  const addEntry = () => {
    setEntries([...entries, { type: 'credit', title: '', amount: 0 }])
  }

  const removeEntry = (idx: number) => {
    const updated = [...entries]
    updated.splice(idx, 1)
    setEntries(updated)
  }

  const handleEmployeeSelect = (emp: any) => {
    setEmployeeId(emp.id)
    setEmployeeQuery(`${emp.first_name} ${emp.last_name}`)
    setShowDropdown(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">تعديل بيانات الراتب</h1>

      <div className="flex items-end gap-2 mb-4">
  {/* Employee search */}
  <div className="relative">
    <label className="block text-sm mb-1">اسم الموظف</label>
    <input
      ref={inputRef}
      type="text"
      value={employeeQuery}
      onChange={(e) => {
        setEmployeeQuery(e.target.value);
        setShowDropdown(true);
      }}
      onFocus={() => setShowDropdown(true)}
      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      className="border px-2 py-1 rounded text-sm w-48"
      placeholder="ابحث عن اسم الموظف"
    />
    {showDropdown && filteredEmployees.length > 0 && (
      <ul className="absolute z-10 bg-white border w-full mt-1 max-h-48 overflow-y-auto rounded shadow text-sm">
        {filteredEmployees.map((emp) => (
          <li
            key={emp.id}
            onClick={() => handleEmployeeSelect(emp)}
            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
          >
            {emp.first_name} {emp.last_name}
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Month filter */}
  <div>
    <label className="block text-sm mb-1">الشهر</label>
    <input
      type="month"
      className="border px-2 py-1 rounded text-sm w-40"
      value={month}
      onChange={(e) => setMonth(e.target.value)}
    />
  </div>

  {/* Search Button */}
  <div className="pt-5">
    <button
      onClick={handleSearch}
      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
    >
      بحث
    </button>
  </div>
</div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {payment && (
       <form onSubmit={handleSubmit} className="mt-6 border-t pt-4">
       <div className="flex flex-wrap gap-4">
         <div className="flex flex-col w-40">
           <label className="mb-1 text-sm">الراتب الأساسي</label>
           <input
             type="number"
             className="border px-2 py-1 rounded text-sm"
             value={salary}
             onChange={(e) => setSalary(e.target.value)}
           />
         </div>
     
         <div className="flex flex-col w-32">
           <label className="mb-1 text-sm">نسبة الشهادة</label>
           <input
             type="number"
             className="border px-2 py-1 rounded text-sm"
             value={certificatePercentage}
             onChange={(e) => setCertificatePercentage(e.target.value)}
           />
         </div>
     
         <div className="flex flex-col w-32">
           <label className="mb-1 text-sm">نسبة الخطورة</label>
           <input
             type="number"
             className="border px-2 py-1 rounded text-sm"
             value={riskPercentage}
             onChange={(e) => setRiskPercentage(e.target.value)}
           />
         </div>
     
         <div className="flex flex-col w-32">
           <label className="mb-1 text-sm">بدل النقل</label>
           <input
             type="number"
             className="border px-2 py-1 rounded text-sm"
             value={transPay}
             onChange={(e) => setTransPay(e.target.value)}
           />
         </div>
     
         <div className="flex flex-col w-32">
           <label className="mb-1 text-sm">نسبة التقاعد</label>
           <input
             type="number"
             className="border px-2 py-1 rounded text-sm"
             value={retirePercentage}
             onChange={(e) => setRetirePercentage(e.target.value)}
           />
         </div>
     
         <div className="flex flex-col w-full max-w-md">
           <label className="mb-1 text-sm">ملاحظات</label>
           <textarea
             className="border px-2 py-1 rounded text-sm resize-y"
             value={note}
             onChange={(e) => setNote(e.target.value)}
             rows={2}
           />
         </div>
       </div>

     
         {/* Entries */}
<div className="border-t pt-4">
  <h2 className="text-base font-semibold mb-2">تفاصيل دائن / مدين</h2>
  {entries.map((entry, idx) => (
    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-1 items-center">
      <select
        className="border p-1 w-full text-sm rounded"
        value={entry.type}
        onChange={(e) => handleEntryChange(idx, 'type', e.target.value)}
      >
        <option value="credit">دائن</option>
        <option value="debit">مدين</option>
      </select>
      <select
        className="border p-1 text-sm rounded"
        value={entry.title}
        onChange={(e) => handleEntryChange(idx, 'title', e.target.value)}
      >
        <option value="">اختر العنوان</option>
        <option value="م منصب">م منصب</option>
        <option value="م زوجية">م زوجية</option>
        <option value="م اطفال">م اطفال</option>
        <option value="سلقة موظف">سلقة موظف</option>
        <option value="سلقة زواج">سلقة زواج</option>
        <option value="قرض مصرفي">قرض مصرفي</option>
        <option value="ضريبة">ضريبة</option>
      </select>
      <input
        className="border p-1 text-sm rounded"
        type="number"
        placeholder="القيمة"
        value={entry.amount}
        onChange={(e) => handleEntryChange(idx, 'amount', +e.target.value)}
      />
      <button
        type="button"
        className="bg-red-500 text-white text-sm px-2 py-1 rounded"
        onClick={() => removeEntry(idx)}
      >
        X
      </button>
    </div>
  ))}
  <button
    type="button"
    className="bg-blue-500 text-white text-sm px-4 py-1 rounded mt-2"
    onClick={addEntry}
  >
    + إضافة إدخال
  </button>
</div>

<div className="flex justify-between mt-4">
  <button
    type="submit"
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    تحديث
  </button>
  <button
    type="button"
    className="bg-green-600 text-white px-4 py-2 rounded"
    onClick={() => router.back()}
  >
    رجوع
  </button>
</div>

        </form>
      )}
    </div>
  )
}
