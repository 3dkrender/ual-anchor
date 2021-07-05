/**
 * UAL Anchor v1.0.6
 * undefined
 * 
 * - Pack by 3DKRender Team
 * 
 * @license
 * Copyright (c) 2017-2019 block.one and its contributors.  All rights reserved.
 * Copyright (c) 2019 Greymass Inc and its contributors.  All rights reserved.
 * 
 * The MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { APIClient } from '@greymass/eosio';
import { Authenticator, Chain, UALError, ButtonStyle, User } from 'universal-authenticator-library';
import { JsonRpc } from 'eosjs';

interface UALAnchorOptions {
    appName: string;
    client?: APIClient;
    rpc?: JsonRpc;
    service?: string;
    disableGreymassFuel?: boolean;
    requestStatus?: boolean;
    fuelReferrer?: string;
    verifyProofs?: boolean;
}
declare class Anchor extends Authenticator {
    rpc: JsonRpc;
    client: APIClient;
    private users;
    private appName;
    private link?;
    private service;
    private chainId;
    private disableGreymassFuel;
    private requestStatus;
    private fuelReferrer;
    private verifyProofs;
    /**
     * Anchor Constructor.
     *
     * @param chains
     * @param options { appName } appName is a required option to use Scatter
     */
    constructor(chains: Chain[], options?: UALAnchorOptions);
    /**
     * Called after `shouldRender` and should be used to handle any async actions required to initialize the authenticator
     */
    init(): Promise<void>;
    /**
     * Resets the authenticator to its initial, default state then calls `init` method
     */
    reset(): void;
    /**
     * Returns true if the authenticator has errored while initializing.
     */
    isErrored(): boolean;
    /**
     * Returns a URL where the user can download and install the underlying authenticator
     * if it is not found by the UAL Authenticator.
     */
    getOnboardingLink(): string;
    /**
     * Returns error (if available) if the authenticator has errored while initializing.
     */
    getError(): UALError | null;
    /**
     * Returns true if the authenticator is loading while initializing its internal state.
     */
    isLoading(): boolean;
    getName(): string;
    /**
     * Returns the style of the Button that will be rendered.
     */
    getStyle(): ButtonStyle;
    /**
     * Returns whether or not the button should render based on the operating environment and other factors.
     * ie. If your Authenticator App does not support mobile, it returns false when running in a mobile browser.
     */
    shouldRender(): boolean;
    /**
     * Returns whether or not the dapp should attempt to auto login with the Authenticator app.
     * Auto login will only occur when there is only one Authenticator that returns shouldRender() true and
     * shouldAutoLogin() true.
     */
    shouldAutoLogin(): boolean;
    /**
     * Returns whether or not the button should show an account name input field.
     * This is for Authenticators that do not have a concept of account names.
     */
    shouldRequestAccountName(): Promise<boolean>;
    /**
     * Login using the Authenticator App. This can return one or more users depending on multiple chain support.
     *
     * @param accountName  The account name of the user for Authenticators that do not store accounts (optional)
     */
    login(): Promise<User[]>;
    /**
     * Logs the user out of the dapp. This will be strongly dependent on each Authenticator app's patterns.
     */
    logout(): Promise<void>;
    /**
     * Returns true if user confirmation is required for `getKeys`
     */
    requiresGetKeyConfirmation(): boolean;
}

export default Anchor;
