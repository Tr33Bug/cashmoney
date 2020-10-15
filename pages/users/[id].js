import { Button, Box, Columns, Heading } from 'react-bulma-components'
import fetch from 'isomorphic-unfetch'
import prepareUrl from '../../util/prepareUrl'
import React, { Component } from 'react'
import TransactionHistory from '../../components/TransactionHistory'

const bills = [1, 2, 5, 10, 20, 50]

const transactionLimit = 10

// Component which takes the initial state from the props and modifies them when adding/removing credits.
class UserComponent extends Component {
    constructor(props) {
        super(props)

        this.state = props.initialState
    }

    render() {
        const props = this.state
        if (props.user == null) {
            return <div>404 User not found</div>
        }

        return (
            <div>
                <Heading>{props.user.name}'s Profile</Heading>
                <Heading size={4}>Credit:</Heading>
                <div>Balance: {props.user.credit_cents / 100}€</div>

                <Button.Group>
                    <input
                        type={'number'}
                        onChange={event => {
                            this.setState({ customAdd: event.target.value })
                        }}
                    />
                    <Button
                        key="custom"
                        color="success"
                        onClick={this.modifyCredit(
                            props,
                            props.customAdd * 100
                        )}
                    >
                        Custom
                    </Button>

                    {bills.map(bill => (
                        <Button
                            key={bill}
                            className="xd"
                            color="success"
                            onClick={this.modifyCredit(props, bill * 100)}
                        >
                            + {bill}€
                        </Button>
                    ))}
                </Button.Group>

                <Button.Group>
                    <input
                        type={'number'}
                        onChange={event => {
                            this.setState({ customSub: -event.target.value })
                        }}
                    />
                    <Button
                        key="custom"
                        color="danger"
                        onClick={this.modifyCredit(
                            props,
                            props.customSub * 100
                        )}
                    >
                        Custom
                    </Button>
                    {bills.map(bill => (
                        <Button
                            key={bill}
                            className="xd"
                            color="danger"
                            onClick={this.modifyCredit(props, bill * -100)}
                        >
                            - {bill}€
                        </Button>
                    ))}
                </Button.Group>

                <Heading size={4}>Buy:</Heading>
                <div>
                    <ul style={{ margin: '-8px' }}>
                        {props.products.map(product => (
                            <li key={product.id} style={{ margin: '8px' }}>
                                <a onClick={this.handleBuy(props, product)}>
                                    <Button
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        color="danger"
                                    >
                                        {product.name +
                                            ': ' +
                                            (product.price_cents / 100).toFixed(
                                                2
                                            ) +
                                            '€'}
                                    </Button>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <TransactionHistory transactions={props.transactions} />
                </div>
                <style jsx>{`
                    li {
                        list-style: none;
                        display: inline-block;
                        width: 150px;
                        margin: 8px;
                        text-align: center;
                    }
                `}</style>

                <style jsx>{`
                    .xd {
                        width: 75px;
                    }
                `}</style>
            </div>
        )
    }

    modifyCredit(props, amount) {
        return async () => {
            try {
                const url = prepareUrl(
                    'api/users/%/credit?change_cents=%',
                    props.user.id,
                    amount
                )
                const result = await fetch(url).then(x => x.json())

                this.setState(s => {
                    let n = { ...s }
                    n.user.credit_cents = result.credit_cents
                    return n
                })
                await this.updateTransactions(props)
            } catch (e) {
                alert(e)
            }
        }
    }

    handleBuy(props, product) {
        return async () => {
            try {
                const url = prepareUrl(
                    'api/users/%/buy?product_id=%',
                    props.user.id,
                    product.id
                )
                const result = await fetch(url).then(x => x.json())

                this.setState(s => {
                    let n = { ...s }
                    n.user.credit_cents = result.credit_cents
                    return n
                })
                await this.updateTransactions(props)
            } catch (e) {
                alert(e)
            }
        }
    }

    handleBuy(props, product) {
        return async () => {
            try {
                const url = prepareUrl(
                    'api/users/%/buy?product_id=%',
                    props.user.id,
                    product.id
                )
                const result = await fetch(url).then(x => x.json())

                this.setState(s => {
                    let n = { ...s }
                    n.user.credit_cents = result.credit_cents
                    return n
                })
                await this.updateTransactions(props)
            } catch (e) {
                alert(e)
            }
        }
    }

    async updateTransactions(props) {
        try {
            const url = prepareUrl(
                'api/users/%/transactions?limit=%',
                props.user.id,
                transactionLimit
            )
            const result = await fetch(url).then(x => x.json())

            this.setState({
                transactions: result,
            })
        } catch (e) {
            alert(e)
        }
    }
}

export async function getServerSideProps(ctx) {
    const id = ctx.params['id']

    const dbUsers = await import('../../db/users')
    const dbProducts = await import('../../db/products')
    const dbTransactions = await import('../../db/transactions')

    const user = dbUsers.getUser(id) || null
    const products = dbProducts.getAllProducts()
    const transactions = dbTransactions.getRecentTransactionsOfUser(
        id,
        transactionLimit
    )

    return {
        props: {
            user,
            products,
            transactions,
        },
    }
}

function UserView(props) {
    return <UserComponent initialState={props} />
}

export default UserView
