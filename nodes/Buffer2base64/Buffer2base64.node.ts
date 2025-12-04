import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Buffer2base64 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Buffer2base64',
		name: 'buffer2base64',
		icon: { light: 'file:Buffer2base64.svg', dark: 'file:Buffer2base64.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Basic Buffer2base64 Node',
		defaults: {
			name: 'Buffer2base64',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Data Buffer Array',
				name: 'dataBuffer',
				type: 'json',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The description text',
			},
			{
				displayName: 'Output Fieldname',
				name: 'outputFieldName',
				type: 'string',
				default: 'base64String',
				placeholder: 'base64String',
				description: 'The name of the field to output the base64 string to',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		// Copy the input items to output
		const outputData = JSON.parse(JSON.stringify(items));

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const data = this.getNodeParameter('dataBuffer', itemIndex, []) as number[];
				const fieldName = this.getNodeParameter('outputFieldName', itemIndex, 'base64String') as string;

				// Convert the numeric byte array directly into a binary Buffer
				const buffer = Buffer.from(data);

				// Convert to base64 correctly
				const base64 = buffer.toString('base64');

				// Store result
				outputData[itemIndex].json[fieldName] = base64;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [outputData];
	}
}
