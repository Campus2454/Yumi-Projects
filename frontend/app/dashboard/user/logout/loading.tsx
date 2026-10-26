import { PageHeader } from "@/src/components/DashSections";
import { Spinner_ring } from "@/src/components/Spinner";

export default function LogoutLoading() {
    return (
        <div>
            <PageHeader title="Logout" />
            <Spinner_ring size={45} border={5} color="#fff" />
        </div>
    );
}
