import { PaymentStatus } from "@/components/payment-status"

interface SuccessPageProps {
  searchParams: {
    payment_id?: string
    external_reference?: string
  }
}

export default function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <PaymentStatus
      status="success"
      paymentId={searchParams.payment_id}
      eventId={searchParams.external_reference?.split("-")[0]}
    />
  )
}
