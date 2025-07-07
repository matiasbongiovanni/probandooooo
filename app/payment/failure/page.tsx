import { PaymentStatus } from "@/components/payment-status"

interface FailurePageProps {
  searchParams: {
    payment_id?: string
    external_reference?: string
  }
}

export default function PaymentFailurePage({ searchParams }: FailurePageProps) {
  return (
    <PaymentStatus
      status="failure"
      paymentId={searchParams.payment_id}
      eventId={searchParams.external_reference?.split("-")[0]}
    />
  )
}
