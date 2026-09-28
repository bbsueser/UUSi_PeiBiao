/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 实验环境统一调度器：根据 envId 分派到具体实验环境客户端。
 * - renode / isEmbedded -> 嵌入式仿真
 * - jupyter             -> Jupyter Notebook 实验
 * - blockchain-*        -> 区块链基础仿真
 * - 其余（工程虚拟仿真等）-> EngineeringSimulationClient
 */

import React from "react";
import EmbeddedSimulationClient from "./EmbeddedSimulationClient";
import JupyterSimulationClient from "./JupyterSimulationClient";
import BlockchainSimulationClient from "./BlockchainSimulationClient";
import EngineeringSimulationClient from "./EngineeringSimulationClient";

interface ExperimentEnvironmentClientProps {
  envId: string;
  onClose?: () => void;
  onBackToLab?: () => void;
  onOpenIndustryCloud?: () => void;
  showToast: (msg: string) => void;
  isEmbedded?: boolean;
}

export default function ExperimentEnvironmentClient({
  envId,
  onClose,
  onBackToLab,
  onOpenIndustryCloud,
  showToast,
  isEmbedded = false
}: ExperimentEnvironmentClientProps) {

  if (envId === "renode" || isEmbedded) {
    return <EmbeddedSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }

  if (envId === "jupyter") {
    return <JupyterSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }

  if (envId === "blockchain-basic-simulation") {
    return <BlockchainSimulationClient onClose={onClose || (() => {})} showToast={showToast} />;
  }

  return (
    <EngineeringSimulationClient
      envId={envId}
      onClose={onClose}
      onBackToLab={onBackToLab}
      onOpenIndustryCloud={onOpenIndustryCloud}
      showToast={showToast}
      isEmbedded={isEmbedded}
    />
  );
}
