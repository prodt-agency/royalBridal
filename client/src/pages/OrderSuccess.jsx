import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import Seo from "@/components/Seo";
function OrderSuccess() {
  const [params] = useSearchParams();
  return (
    <Container className="py-24 text-center">
      <Seo
        title="Order Confirmed | Royal Bridal"
        description="Your Royal Bridal order is confirmed."
      />
      <p className="text-xs font-bold uppercase tracking-[.25em] text-[#9b6b35]">
        Thank you
      </p>
      <h1 className="mt-4 font-serif text-4xl">Your order is confirmed</h1>
      {params.get("order") && (
        <p className="mt-4 text-stone-600">
          Order reference: <strong>{params.get("order")}</strong>
        </p>
      )}
      <Link to="/products">
        <Button className="mt-8">Continue shopping</Button>
      </Link>
    </Container>
  );
}
export default OrderSuccess;
