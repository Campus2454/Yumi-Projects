'use client';
import { useContext, useEffect, useState } from "react";
import { DashPageServerGeneralPremium, PricingTableWrapper, PricingTable, PricingTH, PricingTD, PlanName, HighlightTD } from "@/src/utils/styles";
import { ErrorPopupContext, GuildContext } from "@/src/utils/contexts/Contexts";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/DashSections";

export default function ServerPremiumPage() {
    const [premiumType, setPremiumType] = useState<0 | 1>(0);
    const { guild } = useContext(GuildContext);
    const { updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const router = useRouter();
    const guildId = (useParams().guildId as string | undefined) || guild?.id;
    const ip = process.env.NEXT_PUBLIC_API_IP;
    const check_mark = <h3 style={{ color: '#86ffa3', fontWeight: 900, fontSize: 'larger' }}>✔</h3>;
    const wrong_mark = <h3 style={{ color: '#ff4141', fontWeight: 900, fontSize: 'larger' }}>✘</h3>;


    if (typeof window !== 'undefined' && window.location.hostname !== ip) {
        useEffect(() => {
            router.push(`/dashboard/server/${guildId}/overview`);
            setErrorPopup({
                title: 'Sorry!',
                message: 'This function is currently unavailable.',
                show: true,
            });
        }, []);

        return <div>
            <PageHeader title="Bot Premium" />

            <h1 style={{ textAlign: 'center', color: 'white' }}>Nothing here.</h1>
        </div>;
    }

    return (
        <div>
            <PageHeader title="Bot Premium" />

            <DashPageServerGeneralPremium $premiumType={premiumType}>
                <div id="type" onClick={() => setPremiumType(premiumType === 0 ? 1 : 0)}>
                    <div id="Monthly">Monthly</div>
                    <div id="Yearly">Yearly</div>
                    <div id="switch" />
                </div>

                <div id="pricing">
                    <div id="free">
                        <h1>Free</h1>
                        <h3>{premiumType === 0 ? '฿0/lifetime' : '฿0/lifetime'}</h3>
                        <div>
                            {check_mark}
                            <h3 id='text'>Up maximum <b>message limit</b> to 100</h3>
                        </div>
                        <hr />
                        <div>
                            {wrong_mark}
                            <h3 id='text'>More customizable <b>audit log</b></h3>
                        </div>
                        <hr />
                        <div>
                            {wrong_mark}
                            <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                        </div>
                        <hr />
                        <div>
                            {wrong_mark}
                            <h3 id='text'>More <b>saved queue lists</b></h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'><b>Standard</b> Music Server in CA</h3>
                        </div>
                        <button>Try Now!</button>
                    </div>
                    <div id="tier1">
                        <h1>Tier 1</h1>
                        <h3>{premiumType === 0 ? '฿99/Monthly' : '฿699/Yearly'}</h3>
                        <div>
                            {check_mark}
                            <h3 id='text'>Up maximum <b>message limit</b> to 200</h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More customizable <b>audit log</b></h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More <b>saved queue lists</b></h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'><b>Standard</b> Music Server in CA</h3>
                        </div>
                        <button>Try Now!</button>
                    </div>
                    <div id="tier2">
                        <h1>Tier 2</h1>
                        <h3>{premiumType === 0 ? '฿119/Monthly' : '฿1399/Yearly'}</h3>
                        <div>
                            {check_mark}
                            <h3 id='text'>Up maximum <b>message limit</b> to 300</h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More customizable <b>audit log</b></h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'>More <b>saved queue lists</b></h3>
                        </div>
                        <hr />
                        <div>
                            {check_mark}
                            <h3 id='text'><b>Premium</b> Music Server</h3>
                        </div>
                        <button>Try Now!</button>
                    </div>
                </div>

                <div id="table">
                    <div id="line" />

                    <div id="ptable">
                        <PricingTableWrapper>
                            <PricingTable>
                                <thead>
                                    <tr>
                                        <PricingTH>Features</PricingTH>
                                        <PricingTH>Free</PricingTH>
                                        <PricingTH>Tier 1</PricingTH>
                                        <PricingTH>Tier 2</PricingTH>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <PlanName>Price</PlanName>
                                        <PricingTD>{premiumType === 0 ? '฿0/lifetime' : '฿0/lifetime'}</PricingTD>
                                        <PricingTD>{premiumType === 0 ? '฿99/Monthly' : '฿699/Yearly'}</PricingTD>
                                        <HighlightTD>{premiumType === 0 ? '฿199/Monthly' : '฿1399/Yearly'}</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>Maximum Message Limit</PlanName>
                                        <PricingTD>200</PricingTD>
                                        <PricingTD>1000</PricingTD>
                                        <HighlightTD>Max</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>More customizable audit log</PlanName>
                                        <PricingTD>✘</PricingTD>
                                        <PricingTD>✔</PricingTD>
                                        <HighlightTD>✔</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>DM users a welcome/goodbye message</PlanName>
                                        <PricingTD>✘</PricingTD>
                                        <PricingTD>✔</PricingTD>
                                        <HighlightTD>✔</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>More embeds for Welcome/Goodbye messages</PlanName>
                                        <PricingTD>1</PricingTD>
                                        <PricingTD>3</PricingTD>
                                        <HighlightTD>Max</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>More temporary queue slots available</PlanName>
                                        <PricingTD>✘</PricingTD>
                                        <PricingTD>✔</PricingTD>
                                        <HighlightTD>✔</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>More saved queue lists</PlanName>
                                        <PricingTD>✘</PricingTD>
                                        <PricingTD>✔</PricingTD>
                                        <HighlightTD>✔</HighlightTD>
                                    </tr>
                                    <tr>
                                        <PlanName>Music Server</PlanName>
                                        <PricingTD>Standard</PricingTD>
                                        <PricingTD>Premium</PricingTD>
                                        <HighlightTD>Premium</HighlightTD>
                                    </tr>
                                </tbody>
                            </PricingTable>
                        </PricingTableWrapper>
                    </div>
                </div>
            </DashPageServerGeneralPremium>
        </div>
    );
}
