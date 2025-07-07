import { PaymentStatus } from "@/components/payment-status"

interface PendingPageProps {
  searchParams: {
    payment_id?: string
    external_reference?: string
  }
}

export default function PaymentPendingPage({ searchParams }: PendingPageProps) {
  return (
    <PaymentStatus
      status="pending"
      paymentId={searchParams.payment_id}
      eventId={searchParams.external_reference?.split("-")[0]}
    />
  )
}
