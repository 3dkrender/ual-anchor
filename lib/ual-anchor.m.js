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
import { PackedTransaction, SignedTransaction, FetchProvider, APIClient } from '@greymass/eosio';
import { UALError, User, UALErrorType, Authenticator } from 'universal-authenticator-library';
import { JsonRpc } from 'eosjs';

const AnchorLogo = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS40NCwgMCwgMCwgMS40NCwgLTguNTAxOTI1LCAtNTcuMDc0NTcpIiBzdHlsZT0iIj4KICAgIDx0aXRsZT5XaGl0ZTwvdGl0bGU+CiAgICA8Y2lyY2xlIGN4PSI5NC43OTMiIGN5PSIxMjguNTI0IiByPSI4MCIgZmlsbD0iI0ZCRkRGRiIvPgogICAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0gOTQuNzk5IDc4LjUyNCBDIDk3LjA5OCA3OC41MjQgOTkuMTk1IDc5LjgzNyAxMDAuMTk4IDgxLjkwNiBMIDEyNC4yMDQgMTMxLjQwNiBMIDEyNC43NDYgMTMyLjUyNCBMIDExMS40MDkgMTMyLjUyNCBMIDEwNy41MyAxMjQuNTI0IEwgODIuMDY5IDEyNC41MjQgTCA3OC4xODkgMTMyLjUyNCBMIDY0Ljg1MyAxMzIuNTI0IEwgNjUuMzk1IDEzMS40MDYgTCA4OS40MDEgODEuOTA2IEMgOTAuNDA0IDc5LjgzNyA5Mi41MDEgNzguNTI0IDk0Ljc5OSA3OC41MjQgWiBNIDg2LjkxOSAxMTQuNTI0IEwgMTAyLjY4IDExNC41MjQgTCA5NC43OTkgOTguMjc0IEwgODYuOTE5IDExNC41MjQgWiBNIDExMi43OTMgMTQ5LjUyNCBMIDEyNC43OTggMTQ5LjUyNCBDIDEyNC40MzcgMTY1LjY3NiAxMTEuMDY3IDE3OC41MjQgOTQuNzk5IDE3OC41MjQgQyA3OC41MzIgMTc4LjUyNCA2NS4xNjIgMTY1LjY3NiA2NC44MDEgMTQ5LjUyNCBMIDc2LjgwNiAxNDkuNTI0IEMgNzcuMDg3IDE1Ni44NzggODEuOTc0IDE2My4xNTUgODguNzkzIDE2NS41MiBMIDg4Ljc5MyAxNDEuNTI0IEMgODguNzkzIDEzOC4yMSA5MS40OCAxMzUuNTI0IDk0Ljc5MyAxMzUuNTI0IEMgOTguMTA3IDEzNS41MjQgMTAwLjc5MyAxMzguMjEgMTAwLjc5MyAxNDEuNTI0IEwgMTAwLjc5MyAxNjUuNTI0IEMgMTA3LjYyIDE2My4xNjIgMTEyLjUxMSAxNTYuODgzIDExMi43OTMgMTQ5LjUyNCBaIiBmaWxsPSIjMzY1MEEyIi8+CiAgPC9nPgo8L3N2Zz4=`;

const Name = 'Anchor';

class UALAnchorError extends UALError {
    constructor(message, type, cause) {
        // Hackery to mimic an eosjs error using @greymass/eosio
        let m = message;
        let e = new Error(message);
        if (cause) {
            if (cause.details && cause.details[0]) {
                m = cause.details[0].message;
                e = new Error(cause.details[0].message);
            }
            e.json = {
                code: 500,
                error: cause.error,
                message: 'Internal Service Error'
            };
        }
        super(m, type, e, Name);
    }
}

class AnchorUser extends User {
    constructor(rpc, client, identity) {
        super();
        this.accountName = '';
        this.requestPermission = '';
        const { session } = identity;
        this.accountName = String(session.auth.actor);
        this.chainId = String(session.chainId);
        if (identity.signatures) {
            [this.signerProof] = identity.signatures;
        }
        if (identity.signerKey) {
            this.signerKey = identity.signerKey;
        }
        if (identity.resolvedTransaction) {
            this.signerRequest = identity.transaction;
        }
        this.requestPermission = String(session.auth.permission);
        this.session = session;
        this.client = client;
        this.rpc = rpc;
    }
    objectify(data) {
        return JSON.parse(JSON.stringify(data));
    }
    async signTransaction(transaction, options) {
        try {
            const completedTransaction = await this.session.transact(transaction, options);
            const wasBroadcast = (options.broadcast !== false);
            const serializedTransaction = PackedTransaction.fromSigned(SignedTransaction.from(completedTransaction.transaction));
            return this.returnEosjsTransaction(wasBroadcast, {
                ...completedTransaction,
                transaction_id: completedTransaction.payload.tx,
                serializedTransaction: serializedTransaction.packed_trx.array,
                signatures: this.objectify(completedTransaction.signatures),
            });
        }
        catch (e) {
            const message = 'Unable to sign transaction';
            const type = UALErrorType.Signing;
            const cause = e;
            throw new UALAnchorError(message, type, cause);
        }
    }
    async signArbitrary(publicKey, data, _) {
        throw new UALAnchorError(`Anchor does not currently support signArbitrary(${publicKey}, ${data})`, UALErrorType.Unsupported, null);
    }
    async verifyKeyOwnership(challenge) {
        throw new UALAnchorError(`Anchor does not currently support verifyKeyOwnership(${challenge})`, UALErrorType.Unsupported, null);
    }
    async getAccountName() {
        return this.accountName;
    }
    async getChainId() {
        return this.chainId;
    }
    async getKeys() {
        try {
            const keys = await this.signatureProvider.getAvailableKeys(this.requestPermission);
            return keys;
        }
        catch (error) {
            const message = `Unable to getKeys for account ${this.accountName}.
        Please make sure your wallet is running.`;
            const type = UALErrorType.DataRequest;
            const cause = error;
            throw new UALAnchorError(message, type, cause);
        }
    }
    async isAccountValid() {
        try {
            const account = this.client && await this.client.v1.chain.get_account(this.accountName);
            const actualKeys = this.extractAccountKeys(account);
            const authorizationKeys = await this.getKeys();
            return actualKeys.filter((key) => {
                return authorizationKeys.indexOf(key) !== -1;
            }).length > 0;
        }
        catch (e) {
            if (e.constructor.name === 'UALAnchorError') {
                throw e;
            }
            const message = `Account validation failed for account ${this.accountName}.`;
            const type = UALErrorType.Validation;
            const cause = e;
            throw new UALAnchorError(message, type, cause);
        }
    }
    extractAccountKeys(account) {
        const keySubsets = account.permissions.map((permission) => permission.required_auth.keys.map((key) => key.key));
        let keys = [];
        for (const keySubset of keySubsets) {
            keys = keys.concat(keySubset);
        }
        return keys;
    }
}

class Anchor extends Authenticator {
    /**
     * Anchor Constructor.
     *
     * @param chains
     * @param options { appName } appName is a required option to use Scatter
     */
    constructor(chains, options) {
        super(chains);
        // Storage for AnchorUser instances
        this.users = [];
        // the callback service url, defaults to https://cb.anchor.link
        this.service = 'https://cb.anchor.link';
        // disable Greymass Fuel cosigning, defaults to false
        this.disableGreymassFuel = false;
        // display the request status returned by anchor-link, defaults to false (ual has it's own)
        this.requestStatus = false;
        // The referral account used in Fuel transactions
        this.fuelReferrer = 'teamgreymass';
        // Whether anchor-link should be configured to verify identity proofs in the browser for the app
        this.verifyProofs = false;
        // Establish initial values
        this.chainId = chains[0].chainId;
        this.users = [];
        // Determine the default rpc endpoint for this chain
        const [chain] = chains;
        const [rpc] = chain.rpcEndpoints;
        // Ensure the appName is set properly
        if (options && options.appName) {
            this.appName = options.appName;
        }
        else {
            throw new UALAnchorError('ual-anchor requires the appName property to be set on the `options` argument during initialization.', UALErrorType.Initialization, null);
        }
        // Allow overriding the JsonRpc client via options
        if (options && options.rpc) {
            this.rpc = options.rpc;
        }
        else {
            // otherwise just return a generic rpc instance for this endpoint
            this.rpc = new JsonRpc(`${rpc.protocol}://${rpc.host}:${rpc.port}`);
        }
        // Allow overriding the APIClient via options
        if (options && options.client) {
            this.client = options.client;
        }
        else {
            const provider = new FetchProvider(`${rpc.protocol}://${rpc.host}:${rpc.port}`);
            this.client = new APIClient({ provider });
        }
        // Allow passing a custom service URL to process callbacks
        if (options.service) {
            this.service = options.service;
        }
        // Allow passing of disable flag for Greymass Fuel
        if (options && options.disableGreymassFuel) {
            this.disableGreymassFuel = options.disableGreymassFuel;
        }
        // Allow passing of disable flag for resulting request status
        if (options && options.requestStatus) {
            this.requestStatus = options.requestStatus;
        }
        // Allow specifying a Fuel referral account
        if (options && options.fuelReferrer) {
            this.fuelReferrer = options.fuelReferrer;
        }
        // Allow overriding the proof verification option
        if (options && options.verifyProofs) {
            this.verifyProofs = options.verifyProofs;
        }
    }
    /**
     * Called after `shouldRender` and should be used to handle any async actions required to initialize the authenticator
     */
    async init() {
        // establish anchor-link
        this.link = new AnchorLink({
            chains: [{
                    chainId: this.chainId,
                    nodeUrl: this.client,
                }],
            service: this.service,
            transport: new AnchorLinkBrowserTransport({
                requestStatus: this.requestStatus,
                disableGreymassFuel: this.disableGreymassFuel,
                fuelReferrer: this.fuelReferrer,
            }),
            verifyProofs: this.verifyProofs,
        });
        // attempt to restore any existing session for this app
        const session = await this.link.restoreSession(this.appName);
        if (session) {
            this.users = [new AnchorUser(this.rpc, this.client, { session })];
        }
    }
    /**
     * Resets the authenticator to its initial, default state then calls `init` method
     */
    reset() {
        this.users = [];
    }
    /**
     * Returns true if the authenticator has errored while initializing.
     */
    isErrored() {
        return false;
    }
    /**
     * Returns a URL where the user can download and install the underlying authenticator
     * if it is not found by the UAL Authenticator.
     */
    getOnboardingLink() {
        return 'https://github.com/greymass/anchor/';
    }
    /**
     * Returns error (if available) if the authenticator has errored while initializing.
     */
    getError() {
        return null;
    }
    /**
     * Returns true if the authenticator is loading while initializing its internal state.
     */
    isLoading() {
        return false;
    }
    getName() {
        return 'anchor';
    }
    /**
     * Returns the style of the Button that will be rendered.
     */
    getStyle() {
        return {
            icon: AnchorLogo,
            text: Name,
            textColor: 'white',
            background: '#3650A2'
        };
    }
    /**
     * Returns whether or not the button should render based on the operating environment and other factors.
     * ie. If your Authenticator App does not support mobile, it returns false when running in a mobile browser.
     */
    shouldRender() {
        return !this.isLoading();
    }
    /**
     * Returns whether or not the dapp should attempt to auto login with the Authenticator app.
     * Auto login will only occur when there is only one Authenticator that returns shouldRender() true and
     * shouldAutoLogin() true.
     */
    shouldAutoLogin() {
        return this.users.length > 0;
    }
    /**
     * Returns whether or not the button should show an account name input field.
     * This is for Authenticators that do not have a concept of account names.
     */
    async shouldRequestAccountName() {
        return false;
    }
    /**
     * Login using the Authenticator App. This can return one or more users depending on multiple chain support.
     *
     * @param accountName  The account name of the user for Authenticators that do not store accounts (optional)
     */
    async login() {
        if (this.chains.length > 1) {
            throw new UALAnchorError('UAL-Anchor does not yet support providing multiple chains to UAL. Please initialize the UAL provider with a single chain.', UALErrorType.Unsupported, null);
        }
        try {
            // only call the login method if no users exist, to prevent UI from prompting for login during auto login
            //  some changes to UAL are going to be required to support multiple users
            if (this.users.length === 0) {
                const identity = await this.link.login(this.appName);
                this.users = [new AnchorUser(this.rpc, this.client, identity)];
            }
        }
        catch (e) {
            throw new UALAnchorError(e.message, UALErrorType.Login, e);
        }
        return this.users;
    }
    /**
     * Logs the user out of the dapp. This will be strongly dependent on each Authenticator app's patterns.
     */
    async logout() {
        // Ensure a user exists to logout
        if (this.users.length) {
            // retrieve the current user
            const [user] = this.users;
            // retrieve the auth from the current user
            const { session: { auth } } = user;
            // remove the session from anchor-link
            await this.link.removeSession(this.appName, auth, this.chainId);
        }
        // reset the authenticator
        this.reset();
    }
    /**
     * Returns true if user confirmation is required for `getKeys`
     */
    requiresGetKeyConfirmation() {
        return false;
    }
}

export default Anchor;
//# sourceMappingURL=ual-anchor.m.js.map
