import type { Metadata } from "next";
import { DeployTutorialClient } from "./deploy-tutorial-client";

export const metadata: Metadata = {
	title: "How to Deploy KyoHub — Step-by-Step Beginner Guide",
	description:
		"Complete step-by-step tutorial on how to deploy your own private KyoHub instance using Prisma and Vercel. Designed for non-technical users.",
};

export default function DeployTutorialPage() {
	return <DeployTutorialClient />;
}
